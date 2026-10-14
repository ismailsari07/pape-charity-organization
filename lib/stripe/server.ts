import Stripe from "stripe";

// Server-only. Pinned so checkout, the webhook and its endpoint in the Stripe
// Dashboard all speak the same API version.
export const STRIPE_API_VERSION = "2025-08-27.basil";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});
