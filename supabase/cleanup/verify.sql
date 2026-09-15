-- Post-cleanup verification — READ-ONLY. Run after cleanup.sql has committed.
-- Run in: Supabase Dashboard -> SQL Editor. Each query is safe to run anytime.
-- The SQL editor only shows the LAST statement's result, so highlight and run
-- one numbered query at a time.

-- 1. Dropped tables are gone. Expect 0 rows.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('email_logs', 'email_events', 'team_members', 'news', 'temp_subscriber');

-- 2. Kept tables still exist. Expect all 6 names.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('youth_events', 'user_profiles', 'funds', 'donation_funds', 'donations', 'events')
order by table_name;

-- 3. Row counts after cleanup.
--    Expect: donations 0, test-pattern donations 0, events 0,
--            youth_events 1, user_profiles 1, funds 5, donation_funds 5,
--            subscribers >= 652 (may grow from real signups).
select
  (select count(*) from public.donations)                                      as donations,
  (select count(*) from public.donations
     where stripe_event_id is null and donor_email ilike '%test%')             as test_donations_left,
  (select count(*) from public.events)                                         as events,
  (select count(*) from public.youth_events)                                   as youth_events,
  (select count(*) from public.user_profiles)                                  as user_profiles,
  (select count(*) from public.funds)                                          as funds,
  (select count(*) from public.donation_funds)                                 as donation_funds,
  (select count(*) from public.subscribers)                                    as subscribers;

-- 4. Signup trigger intact (user_profiles backs it). Expect 1 row: on_auth_user_created.
select tgname, pg_get_triggerdef(oid) as definition
from pg_trigger
where tgrelid = 'auth.users'::regclass and not tgisinternal;

-- 5. Shared updated_at function still present and still used. Expect 3 rows:
--    triggers on donation_funds, events, subscribers (no team_members).
select c.relname as table_name, t.tgname
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
where t.tgfoid = 'public.update_updated_at_column'::regproc
order by 1;
