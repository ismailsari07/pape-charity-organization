-- RLS Batch 2 — profiles / contacts / announcements (low risk, SQL only)
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Order: LAST (after batch1.sql, Batch 3 Step A deploy, and batch3.sql).
-- See supabase/rls/README.md for tests and rollback.
--
-- WARNING — do NOT revoke anon's SELECT grant on public.profiles.
-- The existing FOR ALL "Admins can manage ..." policies on donation_funds and
-- events contain EXISTS (SELECT ... FROM public.profiles). Postgres checks
-- table privileges for every relation a query references, so without that
-- grant, anon reads on /donation and /service would fail with
-- "permission denied". RLS alone is what hides the rows from anon.

begin;

-- profiles: "Profiles are viewable by everyone" exposed every admin's email to
-- anon. Every app read of profiles is the signed-in user reading their OWN row
-- (middleware.ts, login page, lib/supabase/auth.ts), always as authenticated.
-- The admin EXISTS checks in other policies also only look at the caller's own
-- row, so they keep working.
drop policy "Profiles are viewable by everyone" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

-- profiles: nothing in the app updates profiles; remove the self-update path.
drop policy "Users can update own profile" on public.profiles;

-- contacts: RLS was OFF with GRANT ALL to anon (anyone could edit or delete).
-- /about (client component, anon) displays every column publicly, so reads stay
-- public. Writes come only from the admin Contacts tab (authenticated admin).
alter table public.contacts enable row level security;
create policy "Anyone can view contacts" on public.contacts
  for select
  using (true);
create policy "Admins can manage contacts" on public.contacts
  for all to authenticated
  using      (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
revoke insert, update, delete, truncate, references, trigger on public.contacts from anon;

-- announcements: RLS was OFF with GRANT ALL to anon (site content could be
-- defaced or deleted). The only reader/writer is the admin Announcements tab
-- (authenticated). Nothing public reads this table today
-- (getHeroBanner / getWidgetAnnouncements have no callers). If a public banner
-- is wired up later, add: for select using (status = 'published').
alter table public.announcements enable row level security;
create policy "Admins can manage announcements" on public.announcements
  for all to authenticated
  using      (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
revoke all on public.announcements from anon;

commit;
