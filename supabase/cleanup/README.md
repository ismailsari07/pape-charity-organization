# Database cleanup (September 2026)

Removes junk found in the September 2026 inventory. All SQL is run **by a person**
in Supabase Dashboard → SQL Editor.

| Action | Target | Detail |
|---|---|---|
| Delete rows | `donations` | 50 seeded test rows (no `stripe_event_id`, test emails, ≤ 2026-02-09) |
| Delete rows | `events` | 3 test events, by id |
| Drop table | `email_logs`, `email_events` | empty, unused |
| Drop table | `team_members` | old duplicate of `contacts` |
| Drop table | `news` | 1 sample row from the mobile prototype |
| Drop table | `temp_subscriber` | 659-row PII import, already in `subscribers`. **Export first.** |
| **Not touched** | `youth_events`, `user_profiles`, `funds`, `donation_funds` | mobile app / signup trigger / FK consolidation deferred |

## Order

1. **RLS `supabase/rls/batch1.sql` must already be applied.** It enables RLS on
   `email_logs` / `email_events`. If this cleanup drops them first, batch1 fails
   and rolls back entirely.
2. **Export `temp_subscriber`** (below) and confirm it prints `OK: 659 rows`.
3. Move the CSV somewhere safe (see "Where the export lands").
4. In `cleanup.sql`, uncomment step 0:
   `set local cleanup.temp_subscriber_exported = 'yes-659';`
5. Run `cleanup.sql`. It's a single transaction with row-count guards, so any
   mismatch aborts everything.
6. Run `verify.sql` one query at a time.
7. Take the fresh schema dump for `supabase/schema.sql` (after RLS batches + cleanup).

## Step 2 — export `temp_subscriber` (read-only)

Run from the repo root (the CLI uses the linked project). It prints only counts
and a checksum, never row contents.

```bash
cd ~/Documents/WorkingFolder/PapeMosque && python3 - <<'PY'
import csv, hashlib, json, os, subprocess, sys

OUT_DIR = os.path.expanduser("~/pape-exports")
OUT = os.path.join(OUT_DIR, "temp_subscriber_2026-09-15.csv")
COLS = ["email_address", "first_name", "last_name", "work_phone", "home_phone",
        "mobile_phone", "gender", "optin_status", "optin_status_last_updated"]
EXPECTED = 659
ROWS_SQL = ("select " + ", ".join(COLS) + " from public.temp_subscriber "
            "order by email_address nulls last, last_name, first_name")
COUNT_SQL = "select count(*) as n from public.temp_subscriber"

def extract_rows(text):
    """Find the first JSON value in text that is a list of rows, or an object with a 'rows' list.
    Skips status lines such as 'Initialising login role...' wherever they appear."""
    dec = json.JSONDecoder()
    i = 0
    while True:
        starts = [p for p in (text.find("[", i), text.find("{", i)) if p != -1]
        if not starts:
            return None
        pos = min(starts)
        try:
            value, end = dec.raw_decode(text, pos)
        except json.JSONDecodeError:
            i = pos + 1
            continue
        if isinstance(value, list) and all(isinstance(r, dict) for r in value):
            return value
        if isinstance(value, dict) and isinstance(value.get("rows"), list):
            return value["rows"]
        i = end

def query(sql):
    # --agent no + --output-format json pins the output to a plain JSON array on stdout,
    # regardless of terminal/agent detection. Status lines go to stderr.
    r = subprocess.run(
        ["npx", "--no-install", "supabase", "db", "query", "--linked",
         "--agent", "no", "--output-format", "json",
         "set transaction read only; " + sql],
        capture_output=True, text=True, timeout=300)
    rows = extract_rows(r.stdout)
    if rows is None:
        rows = extract_rows(r.stderr)
    if r.returncode != 0 or rows is None:
        # Never echo stdout (could contain row data); stderr holds CLI status/errors only.
        sys.exit(f"query failed (exit={r.returncode}); CLI stderr: {r.stderr.strip()[-400:]}")
    return rows

db_count = int(query(COUNT_SQL)[0]["n"])
rows = query(ROWS_SQL)

os.makedirs(OUT_DIR, mode=0o700, exist_ok=True)
os.chmod(OUT_DIR, 0o700)
old_umask = os.umask(0o077)
try:
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(COLS)
        for row in rows:
            w.writerow(["" if row.get(c) is None else row[c] for c in COLS])
finally:
    os.umask(old_umask)
os.chmod(OUT, 0o600)

with open(OUT, newline="", encoding="utf-8") as f:
    file_rows = sum(1 for _ in csv.reader(f)) - 1
with open(OUT, "rb") as f:
    sha = hashlib.sha256(f.read()).hexdigest()

print(f"db_count={db_count} fetched={len(rows)} file_rows={file_rows}")
print(f"file={OUT} dir_perms={oct(os.stat(OUT_DIR).st_mode & 0o777)} file_perms={oct(os.stat(OUT).st_mode & 0o777)}")
print(f"sha256={sha}")
if db_count == len(rows) == file_rows == EXPECTED:
    print(f"OK: {EXPECTED} rows")
else:
    print("MISMATCH: do NOT run cleanup.sql")
    sys.exit(1)
PY
```

Notes:
- The CLI is pinned to `--agent no --output-format json`. Without it, the output
  depends on terminal/agent detection (a text table in a normal terminal), which
  broke the first version of this script. Status lines such as
  "Initialising login role..." go to stderr and are ignored by the parser.
- Read-only: every query runs in a `set transaction read only` transaction.
  As before, the CLI refreshes its temporary `cli_login_postgres` role on each call.
- SQL `NULL` is written as an empty field. The CSV is UTF-8 (Turkish characters
  preserved). If Excel garbles them, import via Data → From Text/CSV → UTF-8.

## Where the export lands

`~/pape-exports/temp_subscriber_2026-09-15.csv` — **outside the repo**, directory
`700`, file `600`. `*.csv` is also gitignored repo-wide as a second guard.

⚠️ This file is **personal data** (emails, names, phones, gender for 659 people).
Store it somewhere safe and access-controlled, e.g. an encrypted drive or the
organisation's secure storage. Don't email it, don't put it in a shared or
public folder, and delete it once it's no longer needed. After you've moved it,
remove the local copy.

## Rollback

- **Deleted rows** (50 donations, 3 events): test data. No rollback needed.
- **Dropped tables**: can't be un-dropped with SQL. The only way back is a
  Supabase backup restore of the whole database. `temp_subscriber` has the CSV
  export as its safety net; the others are empty or junk.
- **Before commit**: any guard failure rolls back the entire script, leaving
  nothing changed.
