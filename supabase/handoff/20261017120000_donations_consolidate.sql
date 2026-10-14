-- Donations · one fund table, Stripe idempotency, refunds, grants
--
-- Written in the website repo (PapeMosque, branch fix/stripe-donations) and
-- handed to pape-admin, which owns migrations. The website code on that
-- branch needs this migration applied BEFORE it is deployed.
--
-- Why: live Stripe payments were never recorded (wrong webhook URL), and the
-- webhook's "unknown" fund fallback violated both the CHECK and the FK on
-- donations.fund_code. The site lists funds from donation_funds while
-- donations pointed at funds; this makes donation_funds the only fund table.
-- funds itself is dropped by the follow-up migration after the site deploy.
--
-- State checked read-only on 2026-10-14: donations has 0 rows; funds and
-- donation_funds hold the same 5 codes; nothing but donations_fund_code_fkey
-- depends on funds.
--
-- Website callers after this migration:
--   - /api/stripe-webhook (service role): insert/upsert donations, update refunds
--   - /api/checkout (anon): select active donation_funds
--   - public /donation page (anon): select active donation_funds
--   - old website /admin (authenticated, profiles.role = 'admin' policies):
--     select donations + daily_donation_totals, select donation_funds,
--     toggle donation_funds.is_active


-- ── donation_funds takes over funds ────────────────────────────────────

alter table public.donation_funds
  add column color text,
  add column ramadan_only boolean not null default false;

update public.donation_funds d
   set color = f.color,
       ramadan_only = f.ramadan_only
  from public.funds f
 where f.code = d.slug;

-- Holding fund for payments whose fund is missing or unknown (payments not
-- made through the site's checkout, or tampered metadata). Never shown on
-- the public page; an admin reassigns these donations by hand.
insert into public.donation_funds (slug, title, description, display_order, is_active, color)
values ('unassigned', 'Atanmamış', 'Fonu belirlenemeyen bağışlar; yönetici atar.', 99, false,
        'bg-neutral-700 text-neutral-100 border-neutral-200')
on conflict (slug) do nothing;

alter table public.donation_funds
  add constraint donation_funds_unassigned_hidden check (slug <> 'unassigned' or is_active = false);


-- ── donations ──────────────────────────────────────────────────────────

alter table public.donations
  drop constraint donations_fund_code_check,
  drop constraint donations_fund_code_fkey,
  add constraint donations_fund_code_fkey
    foreign key (fund_code) references public.donation_funds (slug) on update cascade;

-- stripe_ref is the idempotency key: the Checkout Session id (cs_…) for
-- payments made through checkout (incl. a subscription's first month), the
-- Invoice id (in_…) for monthly renewals. NOT NULL is safe because the table
-- is empty; if rows exist this migration fails and nothing changes.
alter table public.donations
  add column stripe_ref text not null,
  add column stripe_payment_intent text,
  add column refunded_amount_cents integer,
  add column refunded_at timestamptz,
  add constraint donations_stripe_ref_key unique (stripe_ref),
  add constraint donations_stripe_payment_intent_key unique (stripe_payment_intent),
  add constraint donations_amount_positive check (amount_cents > 0),
  add constraint donations_mode_check check (mode in ('payment', 'subscription')),
  add constraint donations_refund_amount_valid
    check (refunded_amount_cents is null or (refunded_amount_cents > 0 and refunded_amount_cents <= amount_cents)),
  add constraint donations_refunded_at_full_only
    check (refunded_at is null or refunded_amount_cents = amount_cents);

comment on column public.donations.stripe_ref is
  'Idempotency key: Checkout Session id (cs_…) or, for monthly renewals, Invoice id (in_…).';
comment on column public.donations.stripe_payment_intent is
  'PaymentIntent (pi_…) that collected the money; charge.refunded is matched on it.';
comment on column public.donations.refunded_amount_cents is
  'Total refunded so far (Stripe charge.amount_refunded); null = no refund.';
comment on column public.donations.refunded_at is
  'Set when the donation is fully refunded; partial refunds only set refunded_amount_cents.';
comment on column public.donations.stripe_event_id is
  'Event that created the row; null for rows backfilled from Stripe objects.';


-- ── daily_donation_totals: net of refunds ──────────────────────────────
-- Same columns and options as before; only the summed amount changes.

create or replace view public.daily_donation_totals with (security_invoker = true) as
 select date(created_at) as date_only,
    sum(case when fund_code = 'zekat'   then amount_cents - coalesce(refunded_amount_cents, 0) else 0 end) / 100 as zekat,
    sum(case when fund_code = 'sadaka'  then amount_cents - coalesce(refunded_amount_cents, 0) else 0 end) / 100 as sadaka,
    sum(case when fund_code = 'general' then amount_cents - coalesce(refunded_amount_cents, 0) else 0 end) / 100 as general,
    sum(case when fund_code = 'cenaze'  then amount_cents - coalesce(refunded_amount_cents, 0) else 0 end) / 100 as cenaze,
    sum(case when fund_code = 'fitre'   then amount_cents - coalesce(refunded_amount_cents, 0) else 0 end) / 100 as fitre
   from public.donations
  where created_at >= (current_date - '3 mons'::interval)
  group by date(created_at)
  order by date(created_at);


-- ── Grants ─────────────────────────────────────────────────────────────
-- RLS policies are unchanged. service_role grants are not touched. anon
-- keeps SELECT on profiles (see 20261006130200_harden_grants.sql): the
-- donation_funds/donations policies read profiles.

revoke all on public.donations      from anon, authenticated;
revoke all on public.donation_funds from anon, authenticated;
revoke all on public.funds          from anon, authenticated;
revoke all on public.daily_donation_totals from anon, authenticated;

-- Public donation page + /api/checkout (RLS: only is_active rows).
grant select on public.donation_funds to anon, authenticated;
-- Old website /admin (RLS: profiles.role = 'admin' only).
grant update (is_active) on public.donation_funds to authenticated;
grant select on public.donations to authenticated;
grant select on public.daily_donation_totals to authenticated;


-- ── Verify (run by hand after applying) ────────────────────────────────
-- select slug, is_active, color is not null as has_color, ramadan_only from public.donation_funds order by display_order;
--   → 6 rows; 'unassigned' inactive; the 5 real funds have a color; fitre ramadan_only.
-- select conname, pg_get_constraintdef(oid) from pg_constraint where conrelid = 'public.donations'::regclass order by 1;
--   → fund_code FK → donation_funds(slug); no donations_fund_code_check.
-- select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type)
--   from information_schema.role_table_grants
--  where table_schema = 'public' and grantee in ('anon', 'authenticated')
--    and table_name in ('donations', 'donation_funds', 'funds', 'daily_donation_totals')
--  group by 1, 2 order by 1, 2;
--   → donation_funds: anon SELECT, authenticated SELECT; donations: authenticated SELECT;
--     daily_donation_totals: authenticated SELECT; funds: none.
--     (the column-level UPDATE (is_active) shows in information_schema.column_privileges)
