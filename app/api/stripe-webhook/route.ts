import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/server";
import { donationFromRenewal, donationFromSession, saveDonation, saveRefund } from "@/lib/stripe/donations";

// Stripe Dashboard endpoint: https://papemosque.ca/api/stripe-webhook (no www: it redirects).
// Events: checkout.session.completed, checkout.session.async_payment_succeeded,
// invoice.paid, charge.refunded.
//
// Logs carry only event ids and error messages, never donor data.
// 500 makes Stripe retry, so it is returned only for failures a retry can fix;
// duplicates and events we don't record answer 200.

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, webhookSecret);
  } catch (e: any) {
    return NextResponse.json(
      { error: `Signature verification failed: ${e.message}` },
      { status: 400 },
    );
  }

  const eventTime = new Date(event.created * 1000);

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        // Delayed payment methods complete as "unpaid"; they are recorded on
        // async_payment_succeeded instead.
        if (session.payment_status !== "paid") break;

        const draft = await donationFromSession(stripe, supabase, session, eventTime, event.id);
        if (draft) await save(event, draft.row, draft.fundAssigned);
        break;
      }

      case "invoice.paid": {
        const draft = await donationFromRenewal(stripe, supabase, event.data.object, event.id);
        if (draft) await save(event, draft.row, draft.fundAssigned);
        break;
      }

      case "charge.refunded": {
        const updated = await saveRefund(supabase, event.data.object, eventTime);
        if (updated === 0) {
          console.warn(`[stripe-webhook] ${event.id}: refund matched no recorded donation (or an older refund event)`);
        }
        break;
      }
    }
  } catch (e: any) {
    console.error(`[stripe-webhook] ${event.type} ${event.id} failed: ${e?.message ?? "unknown error"}`);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function save(event: Stripe.Event, row: Parameters<typeof saveDonation>[1], fundAssigned: boolean) {
  await saveDonation(supabase, row);
  if (!fundAssigned) {
    console.warn(`[stripe-webhook] ${event.id}: fund missing or unknown, saved as unassigned`);
  }
}
