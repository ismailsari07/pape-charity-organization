import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/server";
import { UNASSIGNED_FUND } from "@/lib/stripe/donations";

// Anon client: RLS on donation_funds returns only active funds, the same list
// the public donation page shows.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);

const MIN_AMOUNT_CENTS = 100;
const MAX_AMOUNT_CENTS = 99_999_999; // Stripe's per-payment limit for CAD (999,999.99)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) ?? {};
  } catch {
    return badRequest("Invalid request");
  }
  const { amount, fund, email, mode } = body;

  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email))
    return badRequest("Valid email required");
  if (typeof fund !== "string" || !fund) return badRequest("Fund required");
  if (
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    amount < MIN_AMOUNT_CENTS ||
    amount > MAX_AMOUNT_CENTS
  )
    return badRequest("Amount must be between 1.00 and 999,999.99 CAD");
  if (mode !== "payment" && mode !== "subscription") return badRequest("Invalid mode");

  const { data: fundRow, error: fundError } = await supabase
    .from("donation_funds")
    .select("slug, title")
    .eq("slug", fund)
    .eq("is_active", true)
    .maybeSingle();
  if (fundError) {
    console.error(`[checkout] fund lookup failed (code=${fundError.code})`);
    return NextResponse.json({ error: "Checkout error" }, { status: 500 });
  }
  if (!fundRow || fundRow.slug === UNASSIGNED_FUND) return badRequest("Invalid fund");

  // On the session for checkout.session.*, and on the PaymentIntent or the
  // Subscription so the fund also travels with refunds and monthly renewals.
  const metadata = { fund: fundRow.slug, source: "website" };

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    quantity: 1,
    price_data: {
      currency: "cad",
      product_data: {
        name: `${mode === "subscription" ? "Monthly" : "One-time"} Donation – ${fundRow.title}`,
      },
      unit_amount: amount,
      ...(mode === "subscription" ? { recurring: { interval: "month" } } : {}),
    },
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [lineItem],
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donation/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donation/cancel`,
      metadata,
      ...(mode === "subscription"
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }),
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    // Stripe messages can echo the email; log only the error's type and code.
    console.error(`[checkout] Stripe error (type=${e?.type}, code=${e?.code})`);
    return NextResponse.json({ error: "Checkout error" }, { status: 500 });
  }
}
