# supabase/

Version-controlled record of the Supabase database for this site.

**The Supabase dashboard is the source of truth.** Everything here is a
point-in-time snapshot for review and diffing. It is not a migrations workflow,
so nothing in this folder is applied automatically. After any change made in
the dashboard, take a new snapshot (below) and commit the diff.

## Contents

| Path | What |
|---|---|
| `schema.sql` | `public` schema: tables, views, functions, triggers, **RLS settings, policies, GRANTs**, owners |
| `storage.sql` | Storage buckets and policies, plus triggers on `auth.users` |
| `rls/` | RLS hardening batches 1–3 (applied), with their README |
| `cleanup/` | Junk table/row cleanup (applied), with verification queries |

Current snapshot: **2026-09-15**, PostgreSQL **17.6**.

## Rule for new tables

Supabase's default privileges give `anon` and `authenticated` **`GRANT ALL` on
every new table** in `public`. The anon key ships in the browser bundle, so a
table without RLS is readable and writable by anyone.

**Every new table must `enable row level security` in the same script that
creates it, and its policies go in that same script.** See
`docs/overrides.sql` for the pattern.

## How to regenerate the snapshot

No credentials are ever stored in this repo. You type the database password at
the prompt. It is never placed in a URL, a file, or a command.

Prerequisites:
- `pg_dump` / `psql` matching the server major version (here: 17, at `/usr/lib/postgresql/17/bin/`).
- The project linked via `supabase link`, which writes the Session pooler URL
  **without password** to `supabase/.temp/pooler-url` (gitignored). Alternatively,
  use `<SESSION_POOLER_URI_WITHOUT_PASSWORD>` from Dashboard → Connect → Session pooler
  (port **5432**, not the 6543 transaction pooler).

Run in a normal terminal from the repo root. **Don't prefix with `!`**: in bash
that negates the command, and `&&` then skips the dump.

```bash
OUT=$(mktemp -d)   # outside the repo

# 1. Schema dump (pg_dump runs in a single READ ONLY transaction)
PGSSLMODE=require /usr/lib/postgresql/17/bin/pg_dump \
  -d "$(cat supabase/.temp/pooler-url)" \
  --schema-only --schema=public --no-subscriptions \
  -f "$OUT/schema.raw.sql"

# 2. Storage + auth extras (explicit read-only session)
PGSSLMODE=require psql -X -x -P pager=off -v ON_ERROR_STOP=1 \
  "$(cat supabase/.temp/pooler-url)" -o "$OUT/storage-auth.raw.txt" \
  -c "set session characteristics as transaction read only" \
  -c "show transaction_read_only" \
  -c "select id, name, public, file_size_limit, allowed_mime_types from storage.buckets order by id" \
  -c "select relname, relrowsecurity, relforcerowsecurity from pg_class where relnamespace = 'storage'::regnamespace and relkind = 'r' order by relname" \
  -c "select tablename, policyname, permissive, roles, cmd, qual, with_check from pg_policies where schemaname = 'storage' order by tablename, policyname" \
  -c "select tgname, tgenabled, pg_get_triggerdef(oid) as definition from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal order by tgname"
```

Then, **before anything enters the repo**:

1. Confirm `transaction_read_only | on` at the top of `storage-auth.raw.txt`.
2. **Scan both files** and review every match. Look for `Bearer`, `eyJ` (JWTs),
   `sk_`, `whsec_`, `re_`, `apikey`, `http_request` / `net.http_` (webhook
   triggers often embed keys), `postgres://`, `pooler.supabase`, `password`,
   `secret`, `COPY`, `INSERT INTO` (should appear only inside function bodies),
   email addresses, and UUIDs.
3. Strip the psql restrict/unrestrict lines, whose random key changes on every dump:
   ```bash
   grep -vE '^\\(un)?restrict ' "$OUT/schema.raw.sql" > "$OUT/schema.clean.sql"
   ```
4. Replace the body of `schema.sql` (keep its 4-line header and update the date)
   and update `storage.sql` from the query output.
5. `git diff supabase/` to review what changed in the database, then commit.
6. Delete `$OUT`.

## Never commit

- The database password, a connection string that contains it, or `.pgpass`.
- Raw dumps, data dumps, or CSV exports (`*.csv` is gitignored; exports containing PII live outside the repo).
- `supabase/.temp/` (gitignored; created by `supabase link`).
