# How to add a prayer override via the Supabase dashboard

Overrides let you hand-adjust iqamah times or replace the day's notices, without the
daily cron overwriting your change.

**How it works:** every morning (~05:00 Toronto) the cron fetches fresh times from
Diyanet, then looks for override rows covering that day and applies them before saving.
Your override wins. Nothing else changes — the website, the mosque display screen, and
the mobile app all keep reading the same place as always.

**Enter overrides ahead of time.** An override added *today* for *today* will not appear
until tomorrow's cron run, because today's data was already written this morning.

---

## ⚠️ Read this before typing any time

**Use 12-hour times, with no `a.m.` / `p.m.` suffix — exactly like the times already in
the system.**

| ✅ Correct | ❌ Wrong | Why |
|---|---|---|
| `10:30` | `22:30` | 24-hour clock displays literally as "22:30 p.m" |
| `7:45` | `19:45` | same problem |
| `2:00` | `14:00` | same problem |
| `5:45` | `5:45 p.m.` | the suffix is added automatically — don't type it |

The website adds `a.m` / `p.m` itself based on which prayer it is. If you type `19:30`
for Asr, the site will show **"19:30 p.m"** to everyone. There is no validation that
catches this — please double-check before saving.

Morning times (Fajr) may be zero-padded like `05:45`. Both `5:45` and `05:45` work.

> Note: this rule is about the **iqamah time fields**. Notice *text* is free-form —
> writing "Isha will begin at 10:15 p.m." inside a notice is perfectly fine.

---

## Where to go

Supabase Dashboard → your project → **Table Editor** → **`overrides`** table →
green **Insert** button → **Insert row**.

## The columns

| Column | What to put | Notes |
|---|---|---|
| `id` | *leave blank* | filled in automatically |
| `type` | `iqamah` or `notice` | lowercase |
| `start_date` | `2026-08-15` | first day the override applies |
| `end_date` | `2026-08-19` | last day, **inclusive**. Same as `start_date` for a single day |
| `payload` | JSON — see below | must be valid JSON |
| `created_at` | *leave blank* | filled in automatically |

### `payload` for `type = "iqamah"`

Only list the prayers you want to change. Everything you don't list stays exactly as
Diyanet sent it.

```json
{ "isha": "10:30" }
```

Valid prayer names: `fajr`, `dhuhr`, `asr`, `maghrib`, `isha`
(capitalisation doesn't matter — `isha`, `Isha`, and `ISHA` all work).

`sunrise` is **not** valid — it has no iqamah. If you list it, it is ignored.

### `payload` for `type = "notice"`

```json
{ "text": "Cuma hutbesi bu hafta 13:30'da başlayacaktır." }
```

This **replaces** all of that day's notices with your single message.

---

## Example 1 — Isha changes for 5 days

Isha iqamah moves to 10:30 for Aug 15–19. **One row covers all five days:**

| Column | Value |
|---|---|
| `type` | `iqamah` |
| `start_date` | `2026-08-15` |
| `end_date` | `2026-08-19` |
| `payload` | `{"isha": "10:30"}` |

Fajr, Dhuhr, Asr and Maghrib are untouched on those days. So is Isha's adhan time —
only the iqamah changes. On Aug 20 everything returns to normal automatically.

## Example 2 — A notice for one day

| Column | Value |
|---|---|
| `type` | `notice` |
| `start_date` | `2026-09-01` |
| `end_date` | `2026-09-01` |
| `payload` | `{"text": "* Yarından itibaren yatsı namazı 10:15'te kılınacaktır."}` |

Single day, so both dates are the same.

## Example 3 — Two prayers at once, plus a notice

Ramadan-style adjustment where both Maghrib and Isha shift, and you want to announce it.
That's **two rows** — one per `type`:

Row A:

| Column | Value |
|---|---|
| `type` | `iqamah` |
| `start_date` | `2026-03-01` |
| `end_date` | `2026-03-30` |
| `payload` | `{"maghrib": "6:15", "isha": "8:45"}` |

Row B:

| Column | Value |
|---|---|
| `type` | `notice` |
| `start_date` | `2026-03-01` |
| `end_date` | `2026-03-30` |
| `payload` | `{"text": "Ramazan boyunca akşam ve yatsı vakitleri değişmiştir."}` |

---

## Undoing an override

**Delete the row** (Table Editor → select the row → Delete). The next cron run writes
clean Diyanet data with no override applied. You do not need to change anything else.

To end an override early, edit its `end_date` to yesterday instead of deleting it —
that keeps a record of what was done.

## If two overrides overlap

If two rows change the **same prayer** on the same day, the one created **most recently**
wins. Same for two notices covering one day. You shouldn't need to rely on this — it's a
safety net, not a feature. Prefer editing the existing row over stacking a second one.

## If something looks wrong

- **Change didn't appear:** was the row added *after* that morning's cron run? It applies
  from the next run onward.
- **Time shows as "19:30 p.m":** you used a 24-hour time. Edit the row to 12-hour and it
  corrects on the next run.
- **Nothing at all changed:** check `type` is exactly `iqamah` or `notice` (lowercase),
  and that today falls between `start_date` and `end_date` inclusive.
- **Prayer times still loaded normally but your override was ignored:** that's by design.
  If the override system fails for any reason, the normal Diyanet data is still written —
  a broken override can never take the prayer times offline.
