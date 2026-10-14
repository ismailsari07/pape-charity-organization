import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

// Hidden donation_funds row for payments whose fund is missing or unknown.
// An admin reassigns them; they are never guessed into "general".
export const UNASSIGNED_FUND = "unassigned";

export type DonationRow = {
  stripe_ref: string;
  stripe_event_id: string | null;
  stripe_payment_intent: string | null;
  fund_code: string;
  amount_cents: number;
  currency: string;
  donor_email: string | null;
  mode: "payment" | "subscription";
  created_at: string;
};

export type DonationDraft = { row: DonationRow; fundAssigned: boolean };

const idOf = (v: string | { id?: string } | null | undefined) =>
  typeof v === "string" ? v : (v?.id ?? null);

// Any existing fund counts, active or not: a fund can be switched off between
// checkout and payment, and the money still belongs to it.
export async function resolveFund(
  supabase: SupabaseClient,
  raw: string | null | undefined,
): Promise<{ fund: string; assigned: boolean }> {
  if (!raw || raw === UNASSIGNED_FUND) return { fund: UNASSIGNED_FUND, assigned: false };

  const { data, error } = await supabase.from("donation_funds").select("slug").eq("slug", raw).maybeSingle();
  if (error) throw new Error(`fund lookup failed: ${error.message}`);

  return data ? { fund: data.slug, assigned: true } : { fund: UNASSIGNED_FUND, assigned: false };
}

// Since the basil API an invoice no longer names its PaymentIntent; it lists payments.
export async function invoicePaymentIntent(stripe: Stripe, invoiceId: string): Promise<string | null> {
  const payments = await stripe.invoicePayments.list({ invoice: invoiceId, status: "paid", limit: 1 });
  return idOf(payments.data[0]?.payment.payment_intent);
}

// A paid Checkout Session: a one-time donation, or a subscription's first month.
export async function donationFromSession(
  stripe: Stripe,
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  paidAt: Date,
  eventId: string | null,
): Promise<DonationDraft | null> {
  if (session.mode !== "payment" && session.mode !== "subscription") return null;
  if (!session.amount_total) return null;

  const { fund, assigned } = await resolveFund(supabase, session.metadata?.fund);
  const invoiceId = idOf(session.invoice);
  const paymentIntent =
    session.mode === "payment"
      ? idOf(session.payment_intent)
      : invoiceId
        ? await invoicePaymentIntent(stripe, invoiceId)
        : null;

  return {
    fundAssigned: assigned,
    row: {
      stripe_ref: session.id,
      stripe_event_id: eventId,
      stripe_payment_intent: paymentIntent,
      fund_code: fund,
      amount_cents: session.amount_total,
      currency: (session.currency ?? "cad").toUpperCase(),
      donor_email: session.customer_details?.email ?? session.customer_email ?? null,
      mode: session.mode,
      created_at: paidAt.toISOString(),
    },
  };
}

// A paid renewal invoice of a monthly donation. The first month is recorded
// from its Checkout Session, so only billing_reason "subscription_cycle" counts.
export async function donationFromRenewal(
  stripe: Stripe,
  supabase: SupabaseClient,
  invoice: Stripe.Invoice,
  eventId: string | null,
): Promise<DonationDraft | null> {
  if (invoice.billing_reason !== "subscription_cycle" || !invoice.id || !invoice.amount_paid) return null;

  const { fund, assigned } = await resolveFund(supabase, invoice.parent?.subscription_details?.metadata?.fund);
  const paidAt = invoice.status_transitions.paid_at ?? invoice.created;

  return {
    fundAssigned: assigned,
    row: {
      stripe_ref: invoice.id,
      stripe_event_id: eventId,
      stripe_payment_intent: await invoicePaymentIntent(stripe, invoice.id),
      fund_code: fund,
      amount_cents: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      donor_email: invoice.customer_email ?? null,
      mode: "subscription",
      created_at: new Date(paidAt * 1000).toISOString(),
    },
  };
}

// Idempotent: a donation already recorded under the same stripe_ref is left alone.
export async function saveDonation(supabase: SupabaseClient, row: DonationRow) {
  const { error } = await supabase
    .from("donations")
    .upsert(row, { onConflict: "stripe_ref", ignoreDuplicates: true });
  if (error) throw new Error(`donation insert failed: ${error.message} (code=${error.code})`);
}

// Stores the charge's cumulative refund. refunded_at only for a full refund.
// Never lowers an amount already stored (refund events can arrive out of order).
// Returns how many donations were updated (0 = not a recorded donation, or stale event).
export async function saveRefund(supabase: SupabaseClient, charge: Stripe.Charge, refundedAt: Date) {
  const paymentIntent = idOf(charge.payment_intent);
  if (!paymentIntent || charge.amount_refunded <= 0) return 0;

  const { data, error } = await supabase
    .from("donations")
    .update({
      refunded_amount_cents: charge.amount_refunded,
      refunded_at: charge.refunded ? refundedAt.toISOString() : null,
    })
    .eq("stripe_payment_intent", paymentIntent)
    .or(`refunded_amount_cents.is.null,refunded_amount_cents.lte.${charge.amount_refunded}`)
    .select("id");
  if (error) throw new Error(`refund update failed: ${error.message} (code=${error.code})`);

  return data.length;
}
