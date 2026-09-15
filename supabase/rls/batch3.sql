-- RLS Batch 3 (Step B) — lock down public.subscribers (PII: name, email, phone)
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run.
--
-- !!! DO NOT RUN until Batch 3 Step A (the code change that moves /api/subscribe
-- !!! and /api/unsubscribe to the service-role client) is DEPLOYED and TESTED.
-- !!! If run earlier: subscribe breaks loudly (RLS insert error -> 500) and
-- !!! unsubscribe fails SILENTLY (the UPDATE matches 0 rows and still reports
-- !!! success, so people stay subscribed).
--
-- See supabase/rls/README.md for tests and rollback.

begin;

-- RLS was OFF with GRANT ALL to anon: anyone with the anon key (shipped in the
-- browser bundle) could read, edit or delete the whole subscriber list.
alter table public.subscribers enable row level security;

-- The admin EmailSend tab reads the list in the browser as the signed-in admin
-- (authenticated). Public subscribe/unsubscribe now run server-side with the
-- service role, which bypasses RLS and needs no policy.
create policy "Admins can manage subscribers" on public.subscribers
  for all to authenticated
  using      (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- No anon path touches subscribers any more.
revoke all on public.subscribers from anon;

commit;
