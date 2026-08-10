-- Human-entered overrides for daily prayer data.
--
-- Read ONLY by /api/prayer/refresh (service-role key) at cron time, merged into
-- the pape-api response, then written to prayer_cache. Clients never read this
-- table directly — they keep reading prayer_cache exactly as before.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run.

create table public.overrides (
  id         bigint generated always as identity primary key,

  -- Override kind: "iqamah" or "notice" today.
  -- Deliberately plain text, NOT a Postgres enum: adding a future kind
  -- (e.g. "hadith", "eid") must never require a schema migration.
  -- Unknown types are ignored + logged by the refresh route.
  type       text        not null,

  -- Inclusive date range. A single-day override sets both to the same date.
  start_date date        not null,
  end_date   date        not null,

  -- type="iqamah": partial prayer -> time map, e.g. {"isha": "10:30"}
  --                Only the listed prayers change; the rest stay as Diyanet sent them.
  -- type="notice": {"text": "..."} — replaces that day's notices array entirely.
  payload    jsonb       not null default '{}'::jsonb,

  -- Tie-breaker: if two rows override the same thing on the same day,
  -- the row with the LATEST created_at wins.
  created_at timestamptz not null default now(),

  constraint overrides_date_range_valid check (end_date >= start_date)
);

-- The refresh route's only query is:
--   where start_date <= :today and end_date >= :today
create index overrides_date_range_idx on public.overrides (start_date, end_date);

-- Lock the table down.
--
-- RLS enabled with ZERO policies means anon and authenticated get zero rows —
-- there is no policy for them to satisfy. The service_role key used by
-- /api/prayer/refresh bypasses RLS by design, so the cron still reads fine.
--
-- Do NOT add an anon read policy. Clients have no reason to see this table.
alter table public.overrides enable row level security;

comment on table public.overrides is
  'Human-entered prayer overrides, merged into prayer_cache at cron time. Service-role read only.';
