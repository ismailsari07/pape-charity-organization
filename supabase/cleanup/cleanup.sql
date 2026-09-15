-- Database cleanup — remove agreed junk (September 2026 inventory)
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Read supabase/cleanup/README.md first. In short:
--   1. RLS batch1.sql must already be applied (it references email_logs /
--      email_events; running it after this cleanup would fail).
--   2. The temp_subscriber CSV export must have succeeded (659 rows) and be
--      stored safely. Then uncomment the confirmation line below.
--
-- Everything is one transaction. Every step checks its expected row count and
-- RAISEs if reality differs, which aborts and rolls back the WHOLE script.
-- DROP TABLE is used without CASCADE, so any unexpected dependency also aborts.
--
-- NOT touched (decided): youth_events, user_profiles (mobile app / signup
-- trigger), funds, donation_funds (FK consolidation deferred to admin rewrite).

begin;

-- ---------------------------------------------------------------------------
-- 0. Export confirmation gate for temp_subscriber.
--    Uncomment ONLY after the CSV export printed "OK: 659 rows" and the file
--    is stored somewhere safe. Without it, step 5 aborts the whole script.
-- ---------------------------------------------------------------------------
-- set local cleanup.temp_subscriber_exported = 'yes-659';

-- ---------------------------------------------------------------------------
-- 1. donations: delete the 50 seeded test rows (keep the table).
--    Predicate is deliberately narrow — ALL three must hold:
--      * stripe_event_id IS NULL  -> never came from the Stripe webhook
--                                    (the webhook always sets event.id)
--      * donor_email ILIKE '%test%'
--      * created_at < 2026-02-10  -> seed window ended 2026-02-09
--    A future real donation can't match (it has a stripe_event_id and a later
--    date). Verified read-only on 2026-09-15: matches exactly 50 of 50 rows.
--    Rollback: none after commit (test data; nothing real is lost).
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  delete from public.donations
  where stripe_event_id is null
    and donor_email ilike '%test%'
    and created_at < timestamptz '2026-02-10 00:00:00+00';
  get diagnostics n = row_count;
  if n <> 50 then
    raise exception 'donations: expected to delete 50 test rows, matched %; aborting', n;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. events: delete the 3 test events by id (keep the table).
--    Verified read-only on 2026-09-15:
--      0078238e-...  Aile Toplantısı   2026-01-30
--      045e3dcd-...  Gençlik Sohbeti   2026-02-10
--      fa420c5c-...  Pazar Kahvaltısı  2026-02-18 (12:22:10, "Friday")
--    No foreign keys reference events.
--    Visible effect: /service and the homepage "upcoming events" become empty.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  delete from public.events
  where id in (
    '0078238e-2aa0-4cb5-aa84-a0bf2c4c1e7d',
    '045e3dcd-7e70-46a4-a04e-6d9154ce3d44',
    'fa420c5c-3032-4b6a-8b18-1580f544d893'
  );
  get diagnostics n = row_count;
  if n <> 3 then
    raise exception 'events: expected to delete 3 test rows, matched %; aborting', n;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Pre-drop row-count guards: abort if any table changed since the inventory.
--    email_logs 0, email_events 0, team_members 5, news 1, temp_subscriber 659.
-- ---------------------------------------------------------------------------
do $$
begin
  if (select count(*) from public.email_logs)      <> 0   then raise exception 'email_logs is no longer empty; aborting'; end if;
  if (select count(*) from public.email_events)    <> 0   then raise exception 'email_events is no longer empty; aborting'; end if;
  if (select count(*) from public.team_members)    <> 5   then raise exception 'team_members row count changed; aborting'; end if;
  if (select count(*) from public.news)            <> 1   then raise exception 'news row count changed; aborting'; end if;
  if (select count(*) from public.temp_subscriber) <> 659 then raise exception 'temp_subscriber row count changed since export; aborting'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Drop unused tables (none referenced by app code).
--
--    email_events + email_logs: dropped in ONE statement because
--    email_events.email_log_id -> email_logs(id) (FK). email_logs' own FK to
--    subscribers is on the email_logs side, so subscribers is unaffected.
--    Both empty. No views, publications or function bodies reference them.
--    Their RLS/grants go with them.
--
--    team_members: 5 rows, an older duplicate of contacts (same 5 positions).
--    Its trigger update_team_members_updated_at and its 2 policies are dropped
--    with it; the shared function update_updated_at_column() stays (still used
--    by events, donation_funds, subscribers).
--
--    news: 1 sample row ("New Prayer Hall Opens", 2026-05-06). Its 4 policies
--    go with it. No FK/view/function references. NOTE: it came from the same
--    prototype as youth_events (kept); if the mobile app reads news, it will
--    start getting "relation does not exist".
--
--    Rollback: a dropped table can't be un-dropped in SQL. The only way back is
--    a Supabase backup restore (whole database). The table definitions are in
--    the pre-cleanup schema dump if a recreate were ever needed.
-- ---------------------------------------------------------------------------
drop table public.email_events, public.email_logs;
drop table public.team_members;
drop table public.news;

-- ---------------------------------------------------------------------------
-- 5. temp_subscriber: 659-row PII import, already copied into subscribers.
--    SAFETY NET = the offline CSV export. Gated on the confirmation line in
--    step 0; without it, this raises and the WHOLE script (steps 1–4 too) is
--    rolled back.
--    No FKs, views, policies, triggers or function bodies reference it.
-- ---------------------------------------------------------------------------
do $$
begin
  if coalesce(current_setting('cleanup.temp_subscriber_exported', true), '') <> 'yes-659' then
    raise exception 'temp_subscriber export not confirmed (see step 0); aborting whole cleanup';
  end if;
end $$;
drop table public.temp_subscriber;

commit;
