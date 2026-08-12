import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const record = {
      stripe_event_id: event.id,
      fund_code: session.metadata?.fund ?? "unknown",
      amount_cents: session.amount_total ?? 0,
      currency: (session.currency ?? "CAD").toUpperCase(),
      donor_email:
        session.customer_details?.email ?? session.customer_email ?? null,
      mode: session.mode ?? "payment",
    };

    const { error } = await supabase.from("donations").insert(record);

    if (error) {
      console.error(
        `Supabase insert error for stripe_event_id=${event.id}: ${error.message} (code=${error.code})`,
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
