# RLS hardening — Batches 1–3

Closes the Row Level Security holes found in the September 2026 schema review
(confirmed by Dashboard → Advisors → Security Advisor): tables with RLS off and
`GRANT ALL` to `anon`, over-permissive policies, a view that bypassed RLS, and
an orphan function that created admins.

All SQL is run **by a person** in **Supabase Dashboard → SQL Editor**. Each file
is a single `begin; … commit;` transaction, so a failure applies nothing.

> **Background — why order matters.** Every `lib/api/*` module uses the
> browser anon client. On the server (API routes) that client has no session,
> so it runs as `anon`. The admin panel runs in the browser as `authenticated`.
> Only `/api/stripe-webhook` and `/api/prayer/refresh` use the service role.
> `/api/subscribe` and `/api/unsubscribe` relied on anon access to
> `subscribers`, which is why they must move to the service role **before**
> RLS is enabled on that table.

---

## HOW TO APPLY — strict order

| # | Unit | Type | Depends on |
|---|------|------|------------|
| 1 | `batch1.sql` | SQL | — |
| 2 | **Batch 3 Step A** — `lib/supabase/admin.ts`, `lib/server/subscribers.ts`, route imports | Code: commit → deploy → test | — |
| 3 | `batch3.sql` (Batch 3 Step B) | SQL | **Step A deployed AND tested in production** |
| 4 | `batch2.sql` | SQL | — (last, because it touches admin login) |
| 5 | Fresh schema dump → `supabase/schema.sql` | Snapshot | All of the above |

> ⚠️ **Never run `batch3.sql` before Step A is live.** Subscribe would break
> loudly (500), and unsubscribe would fail **silently**: an RLS-blocked
> `UPDATE` matches 0 rows, returns no error, and the route still redirects to
> the success page while the person stays subscribed.

After each SQL batch, re-run **Advisors → Security Advisor**.

---

## 1 · Batch 1 — `batch1.sql` (zero risk)

Drops `donations` "Public can insert donations" and `prayer_cache` "allow
public insert"; makes `daily_donation_totals` `security_invoker` and revokes it
from anon; enables RLS on `email_logs` / `email_events` (service role only);
drops `create_profile_for_user()`; scopes the `user_profiles` insert policy to
the caller's own id.

**Test after applying**
- Homepage: prayer times load.
- `/admin` → Donations tab: the daily totals chart still renders.
- Stripe test-mode donation completes, and the row appears in `donations`.
- Read-only check in the SQL editor (expect `permission denied` for both):
  ```sql
  begin; set local role anon; select count(*) from public.daily_donation_totals; rollback;
  begin; set local role anon; select count(*) from public.email_logs; rollback;
  ```

**Rollback** (definitions taken from the pre-change dump):
```sql
begin;
create policy "Public can insert donations" on public.donations for insert with check (((amount_cents > 0) and (fund_code is not null)));
create policy "allow public insert" on public.prayer_cache for insert with check (true);
alter view public.daily_donation_totals set (security_invoker = false);
grant all on public.daily_donation_totals to anon;
alter table public.email_logs  disable row level security;
alter table public.email_events disable row level security;
grant all on public.email_logs, public.email_events to anon, authenticated;
drop policy "User can insert own profile" on public.user_profiles;
create policy "User can insert own profile" on public.user_profiles for insert with check (true);
commit;
-- create_profile_for_user() is intentionally NOT restored.
```

---

## 2 · Batch 3 Step A — code (commit → deploy → test)

- `lib/supabase/admin.ts`: server-only service-role client (`import "server-only"`
  fails the build if a Client Component imports it).
- `lib/server/subscribers.ts`: server-only `createSubscriber` /
  `unsubscribeByEmail` using that client.
- `app/api/subscribe/route.ts`, `app/api/unsubscribe/route.ts`: import from
  `@/lib/server/subscribers` instead of `@/lib/api/subscribers`.
- `lib/api/subscribers.ts` is **unchanged** and keeps the browser client (used by
  the admin EmailSend tab). It must never get the service role.

This change is safe on its own. The routes behave the same before and after
`batch3.sql`, because the service role bypasses RLS either way.

**Test after deploy** (before running `batch3.sql`)
- Subscribe with a new email from the homepage drawer → success toast; row exists with `status = active`.
- Subscribe again with the same email → "already subscribed" (409).
- Open `/api/unsubscribe?email=<that email>` → redirect to `/unsubscribe/success`; row now `status = unsubscribed` (**check the row itself**).
- Subscribe again with that email → reactivated to `active`.
- Admin → EmailSend tab lists subscribers.

**Rollback:** revert the Step A commit and redeploy (only safe while `batch3.sql` has **not** been applied).

---

## 3 · Batch 3 Step B — `batch3.sql` (only after Step A is live and tested)

Enables RLS on `subscribers`, adds an admin-only policy, revokes anon.

**Test after applying**: repeat **all** Step A tests. They are the real proof
that the routes use the service role. After unsubscribing, **check the row's
status** in Table Editor, because that failure mode is silent. Then:
```sql
-- expect: permission denied
begin; set local role anon; select count(*) from public.subscribers; rollback;
```

**Rollback (one line):**
```sql
alter table public.subscribers disable row level security; grant all on public.subscribers to anon;
```

---

## 4 · Batch 2 — `batch2.sql` (low risk; touches admin login)

`profiles`: own-row select only, drops self-update. `contacts`: RLS on, public
read, admin writes. `announcements`: RLS on, admin only.

> Do **not** revoke anon's `SELECT` on `profiles`. Other tables' admin
> policies reference it, and `/donation` and `/service` would start failing
> with "permission denied".

**Test after applying**
- Log out → log in as admin → `/admin` loads (middleware reads the admin's own `profiles` row).
- A signed-in non-admin (or logged-out user) visiting `/admin` is redirected.
- `/about` shows contacts.
- `/donation` and `/service` still load (anon reads through policies that reference `profiles`).
- Admin → Contacts tab: create / edit / delete. Announcements tab: create / edit / publish / archive / delete.
- Read-only checks:
  ```sql
  begin; set local role anon; select count(*) from public.profiles; rollback;       -- expect 0
  begin; set local role anon; select count(*) from public.announcements; rollback;  -- expect permission denied
  begin; set local role anon; select count(*) from public.contacts; rollback;       -- expect > 0 (public)
  ```

**Rollback (emergency, one line):**
```sql
alter table public.contacts disable row level security; alter table public.announcements disable row level security; grant all on public.contacts, public.announcements to anon;
```
Profiles policy rollback (if admin login breaks):
```sql
begin;
drop policy "Users can view own profile" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using ((auth.uid() = id));
commit;
```

---

## 5 · After all batches — schema snapshot

Take a fresh read-only dump (same method as the September 2026 review:
`pg_dump` 17 `--schema-only --schema=public --no-subscriptions` through the
Session pooler, plus the storage/auth queries). Scan it for secrets, strip the
`\restrict` / `\unrestrict` lines, and commit it as `supabase/schema.sql`.

## Rule for new tables

Supabase default privileges give `anon` and `authenticated` `GRANT ALL` on every
new table in `public`. **Every new table must `enable row level security` in the
same script that creates it** (as `docs/overrides.sql` does).
