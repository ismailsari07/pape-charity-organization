// Backfill donations that Stripe collected but the webhook never recorded.
//
//   node --env-file=.env scripts/backfill-donations.mts            # dry run (default)
//   node --env-file=.env scripts/backfill-donations.mts --apply    # insert
//
// Env: STRIPE_RESTRICTED_KEY (rk_live_…, Read on Checkout Sessions, Invoices,
// Subscriptions, PaymentIntents, Charges; nothing else), NEXT_PUBLIC_SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY. Optional: BACKFILL_FROM (default 2026-04-01) and
// BACKFILL_TO (default 2026-10-14 22:12:05 UTC, when the fixed webhook went live;
// it records everything after that, incl. the refunded CAD 1.00 test).
//
// Reads paid Checkout Sessions and monthly renewal invoices, builds rows with the
// same code the webhook uses, and marks refunds from the charges. Idempotent:
// rows whose stripe_ref already exists are skipped. Prints no donor data.

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  UNASSIGNED_FUND,
  donationFromRenewal,
  donationFromSession,
  type DonationRow,
} from "../lib/stripe/donations.ts";
import { STRIPE_API_VERSION } from "../lib/stripe/server.ts";

const apply = process.argv.includes("--apply");
const from = new Date(process.env.BACKFILL_FROM ?? "2026-04-01T00:00:00-04:00");
const to = new Date(process.env.BACKFILL_TO ?? "2026-10-14T22:12:05Z");

const key = process.env.STRIPE_RESTRICTED_KEY;
if (!key?.startsWith("rk_")) throw new Error("STRIPE_RESTRICTED_KEY (rk_…) is required");

const stripe = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

type Planned = {
  row: DonationRow & { refunded_amount_cents: number | null; refunded_at: string | null };
  fundSource: "metadata" | "product name" | "UNASSIGNED";
  refundNote: string;
  exists: boolean;
};

const created = { gte: Math.floor(from.getTime() / 1000), lt: Math.floor(to.getTime() / 1000) };
const toIso = (unix: number) => new Date(unix * 1000).toISOString();

// ── Funds (all, incl. inactive) for the product-name fallback ───────────
const { data: funds, error: fundsError } = await supabase.from("donation_funds").select("slug, title");
if (fundsError) throw new Error(`donation_funds: ${fundsError.message}`);

// Old checkout named products "One-time Donation – ZEKAT" (slug); the current one uses the title.
function fundFromProductName(name: string | undefined) {
  const label = name?.split("–").pop()?.trim().toLocaleLowerCase("tr");
  if (!label) return null;
  const match = funds!.find(
    (f) => f.slug !== UNASSIGNED_FUND && (f.slug === label || f.title.toLocaleLowerCase("tr") === label),
  );
  return match?.slug ?? null;
}

// ── Charges: reconciliation + refunds ───────────────────────────────────
const charges = new Map<string, Stripe.Charge>();
for await (const c of stripe.charges.list({ created, limit: 100, expand: ["data.refunds"] })) {
  const pi = typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id;
  if (c.status === "succeeded" && pi) charges.set(pi, c);
}

function withRefund(row: DonationRow): Pick<Planned, "row" | "refundNote"> {
  const charge = row.stripe_payment_intent ? charges.get(row.stripe_payment_intent) : undefined;
  if (charge) row.created_at = toIso(charge.created); // when the money was taken
  if (!charge || charge.amount_refunded <= 0) {
    return { row: { ...row, refunded_amount_cents: null, refunded_at: null }, refundNote: charge ? "no" : "no (charge not found)" };
  }
  const lastRefund = charge.refunds?.data.map((r) => r.created).sort().pop();
  const full = charge.refunded;
  return {
    row: {
      ...row,
      refunded_amount_cents: charge.amount_refunded,
      refunded_at: full ? toIso(lastRefund ?? charge.created) : null,
    },
    refundNote: full ? "FULL" : `partial ${(charge.amount_refunded / 100).toFixed(2)}`,
  };
}

// ── Build rows ──────────────────────────────────────────────────────────
const planned: Planned[] = [];
let unpaidSessions = 0;

for await (const session of stripe.checkout.sessions.list({ created, status: "complete", limit: 100 })) {
  if (session.payment_status !== "paid") {
    unpaidSessions++;
    continue;
  }
  const draft = await donationFromSession(stripe, supabase, session, new Date(session.created * 1000), null);
  if (!draft) continue;

  let fundSource: Planned["fundSource"] = "metadata";
  if (!draft.fundAssigned) {
    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
    const slug = fundFromProductName(items.data[0]?.description ?? undefined);
    if (slug) {
      draft.row.fund_code = slug;
      fundSource = "product name";
    } else {
      fundSource = "UNASSIGNED";
    }
  }
  planned.push({ ...withRefund(draft.row), fundSource, exists: false });
}

for await (const invoice of stripe.invoices.list({ created, status: "paid", limit: 100 })) {
  const draft = await donationFromRenewal(stripe, supabase, invoice, null);
  if (!draft) continue;
  planned.push({ ...withRefund(draft.row), fundSource: draft.fundAssigned ? "metadata" : "UNASSIGNED", exists: false });
}

planned.sort((a, b) => a.row.created_at.localeCompare(b.row.created_at));

// ── Already recorded? ───────────────────────────────────────────────────
if (planned.length) {
  const { data: existing, error } = await supabase
    .from("donations")
    .select("stripe_ref")
    .in("stripe_ref", planned.map((p) => p.row.stripe_ref));
  if (error) throw new Error(`donations lookup: ${error.message}`);
  const refs = new Set(existing.map((e) => e.stripe_ref));
  for (const p of planned) p.exists = refs.has(p.row.stripe_ref);
}

// Charges no session/invoice explains (e.g. a payment made in the Dashboard).
const covered = new Set(planned.map((p) => p.row.stripe_payment_intent));
const uncovered = [...charges.entries()].filter(([pi]) => !covered.has(pi)).map(([, c]) => c);

// ── Report (no donor data) ──────────────────────────────────────────────
const cad = (cents: number) => (cents / 100).toFixed(2).padStart(9);
const day = (iso: string) => new Date(iso).toLocaleString("sv-SE", { timeZone: "America/Toronto" }).slice(0, 16);

console.log(`\nBackfill ${apply ? "APPLY" : "DRY RUN"} · Stripe live · ${day(from.toISOString())} → ${day(to.toISOString())} (Toronto)\n`);
console.log("  #  date (Toronto)    amount CAD  type      fund        fund source    refund             status");
planned.forEach((p, i) => {
  const r = p.row;
  console.log(
    `${String(i + 1).padStart(3)}  ${day(r.created_at)}  ${cad(r.amount_cents)}   ${(r.mode === "payment" ? "one-time" : "monthly").padEnd(8)}  ${r.fund_code.padEnd(10)}  ${p.fundSource.padEnd(13)}  ${p.refundNote.padEnd(17)}  ${p.exists ? "already recorded" : "would insert"}`,
  );
});

const toInsert = planned.filter((p) => !p.exists);
const sum = (ps: Planned[], f: (p: Planned) => number) => ps.reduce((s, p) => s + f(p), 0);
const gross = sum(planned, (p) => p.row.amount_cents);
const refunded = sum(planned, (p) => p.row.refunded_amount_cents ?? 0);
const byFund = new Map<string, number>();
for (const p of planned) {
  byFund.set(p.row.fund_code, (byFund.get(p.row.fund_code) ?? 0) + p.row.amount_cents - (p.row.refunded_amount_cents ?? 0));
}

console.log(`\nPayments found: ${planned.length} · gross CAD ${cad(gross).trim()} · refunded CAD ${cad(refunded).trim()} · net CAD ${cad(gross - refunded).trim()}`);
console.log(`Net by fund: ${[...byFund].map(([f, c]) => `${f} ${cad(c).trim()}`).join(" · ")}`);
console.log(`To insert: ${toInsert.length} · already recorded: ${planned.length - toInsert.length} · unassigned fund: ${planned.filter((p) => p.fundSource === "UNASSIGNED").length}`);
const chargeTotal = [...charges.values()].reduce((s, c) => s + c.amount, 0);
console.log(`Reconciliation: ${charges.size} succeeded charge(s) in the window, CAD ${cad(chargeTotal).trim()}`);
if (unpaidSessions) console.log(`Skipped: ${unpaidSessions} completed session(s) not paid`);
for (const c of uncovered) {
  console.log(`  ! charge not from checkout/renewal: ${day(toIso(c.created))}  CAD ${cad(c.amount).trim()}  (handle by hand)`);
}

if (!apply) {
  console.log("\nDry run: nothing written. Re-run with --apply to insert.\n");
} else if (toInsert.length) {
  const { data, error } = await supabase
    .from("donations")
    .upsert(toInsert.map((p) => p.row), { onConflict: "stripe_ref", ignoreDuplicates: true })
    .select("id");
  if (error) throw new Error(`insert failed: ${error.message} (code=${error.code})`);
  console.log(`\nInserted ${data.length} row(s).\n`);
} else {
  console.log("\nNothing to insert.\n");
}
