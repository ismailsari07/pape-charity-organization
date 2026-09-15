-- RLS Batch 1 — zero-risk tightening (no app path depends on this access)
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Order: FIRST. See supabase/rls/README.md for the full apply order, tests and rollback.
--
-- Wrapped in one transaction: if any statement fails (e.g. a policy name no
-- longer matches), nothing is applied. Policy drops deliberately have no
-- IF EXISTS so a mismatch fails loudly instead of silently doing nothing.

begin;

-- donations: "Public can insert donations" let anyone with the anon key insert
-- fake donation rows. Real donations are written only by /api/stripe-webhook,
-- which uses the service-role key (bypasses RLS) and doesn't need this policy.
drop policy "Public can insert donations" on public.donations;

-- prayer_cache: "allow public insert" (WITH CHECK true) let anyone insert fake
-- prayer times for dates the cron hasn't written yet. The only writer is
-- /api/prayer/refresh (service role upsert). Reads keep using the existing
-- "Allow public select" policy (PrayerTimes.tsx, /api/prayer/today).
drop policy "allow public insert" on public.prayer_cache;

-- daily_donation_totals: the view is owned by postgres and ran with the
-- owner's rights, bypassing RLS on donations — and anon had GRANT ALL on it.
-- security_invoker makes donations RLS apply as the caller, so only admins
-- ("Only admins can view donations") see the totals. Used only by the admin
-- Donations tab (authenticated).
alter view public.daily_donation_totals set (security_invoker = true);
revoke all on public.daily_donation_totals from anon;

-- email_logs / email_events: RLS was OFF with GRANT ALL to anon. No app code
-- reads or writes these tables. Enable RLS with zero policies (= service role
-- only) and drop the client-role grants.
alter table public.email_logs  enable row level security;
alter table public.email_events enable row level security;
revoke all on public.email_logs, public.email_events from anon, authenticated;

-- create_profile_for_user(): orphan SECURITY DEFINER trigger function that
-- inserts every new user into profiles with role = 'admin'. Not attached to
-- any trigger today; dangerous if it ever is. If a trigger does still depend
-- on it, DROP fails and the whole batch rolls back (built-in safety check).
drop function public.create_profile_for_user();

-- user_profiles: "User can insert own profile" had WITH CHECK (true), so anyone
-- could insert rows with any id. Not used by this app; the signup trigger
-- (handle_new_user, SECURITY DEFINER) bypasses RLS and doesn't need it.
-- Re-created scoped to the caller's own id so any legitimate client still works.
drop policy "User can insert own profile" on public.user_profiles;
create policy "User can insert own profile" on public.user_profiles
  for insert to authenticated
  with check (auth.uid() = id);

commit;
