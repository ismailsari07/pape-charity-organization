// Pure rules for the 30-day prayer_cache window (no I/O, unit-tested in
// range.test.ts). The refresh route stores only what passes here, and the
// database checks the same per-day rules again (prayer_source_valid, pape-admin
// M1). Owner's rule: prayer_cache never holds a guessed or unvalidated day;
// when real data runs out, it runs out.

export const TZ = "America/Toronto";
/** Days after today a stored row may be for (Monthly gives about 31). */
export const WINDOW_DAYS = 40;
/** Real day-to-day change of a prayer time in Toronto is about 2 minutes. */
export const MAX_DAILY_DRIFT_MIN = 5;
/** Eid has a yearly quota: call it again only after this many days. */
export const EID_REFRESH_DAYS = 7;
/** Alert when fewer stored days than this lie ahead of today. */
export const MIN_HORIZON_DAYS = 7;

export const PRAYER_NAMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

// ── Toronto calendar ────────────────────────────────────────────────────

/** `yyyy-MM-dd` of an instant on the Toronto calendar. */
export function torontoDate(at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Calendar-day arithmetic on `yyyy-MM-dd` (DST-proof: no 24 h steps). */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const ms = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
  return Math.round((ms(to) - ms(from)) / 86_400_000);
}

/** Toronto's UTC offset in minutes at noon on a date (-240 EDT, -300 EST). */
export function torontoOffsetMinutes(iso: string): number {
  const noonUtc = new Date(`${iso}T17:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(noonUtc)
    .find((p) => p.type === "timeZoneName")!.value; // "GMT-04:00"
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

// ── Times ───────────────────────────────────────────────────────────────

/**
 * Minutes after midnight for a stored prayer time, or null. pape-api writes
 * afternoon/evening times as 12-hour clock without AM/PM; same rules as the
 * database's push_prayer_clock and the panel's prayerClock.
 */
export function prayerMinutes(name: string, hhmm: unknown): number | null {
  const m = typeof hhmm === "string" ? /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim()) : null;
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  if (h < 13) {
    if (name === "Dhuhr" && h <= 10) h += 12;
    else if ((name === "Asr" || name === "Maghrib" || name === "Isha") && h < 12) h += 12;
  }
  return h * 60 + min;
}

type Prayer = { name?: unknown; time?: unknown; iqamah?: unknown };
type Source = { gregorianDate?: unknown; dailyPrayerTimes?: unknown; jumaaPrayerTime?: unknown; eidPrayerTimes?: unknown };

function prayersOf(source: unknown): Prayer[] | null {
  const list = (source as Source | null)?.dailyPrayerTimes;
  return Array.isArray(list) ? (list as Prayer[]) : null;
}

/** "18.10.2026" for "2026-10-18". */
export function diyanetDate(iso: string): string {
  return iso.split("-").reverse().join(".");
}

// ── One day ─────────────────────────────────────────────────────────────

/**
 * Why a day's source payload must not be stored, or null if it may. Same
 * rules as the database's prayer_source_valid (pape-admin M1).
 */
export function sourceProblem(date: string, source: unknown): string | null {
  if (!source || typeof source !== "object" || Array.isArray(source)) return "not_an_object";
  const s = source as Source;
  if (s.gregorianDate !== diyanetDate(date)) return "date_mismatch";

  const prayers = prayersOf(s);
  if (!prayers || prayers.length !== PRAYER_NAMES.length) return "prayer_count";
  let previous = -1;
  for (let i = 0; i < PRAYER_NAMES.length; i++) {
    const name = PRAYER_NAMES[i];
    const p = prayers[i];
    if (p?.name !== name) return `prayer_name_${i}`;
    const morning = name === "Fajr" || name === "Sunrise";
    if (typeof p.time !== "string" || !(morning ? /^\d{2}:\d{2}$/ : /^\d{1,2}:\d{2}$/).test(p.time)) return `${name}_time`;
    if (name === "Sunrise") {
      if ("iqamah" in p) return "Sunrise_iqamah";
    } else if (typeof p.iqamah !== "string" || !/^\d{1,2}:\d{2}$/.test(p.iqamah)) {
      return `${name}_iqamah`;
    }
    const minutes = prayerMinutes(name, p.time);
    if (minutes === null) return `${name}_time`;
    if (minutes <= previous) return "out_of_order";
    previous = minutes;
  }
  if (s.jumaaPrayerTime !== "1:00" && s.jumaaPrayerTime !== "2:00") return "jumaa";
  return null;
}

// ── Neighbouring days ───────────────────────────────────────────────────

/**
 * Why two consecutive days can't both be right (a time jumped by more than
 * a day's drift), or null. The 1-hour jump on a DST change is expected:
 * the offset difference is taken out first.
 */
export function continuityProblem(date: string, today: unknown, tomorrow: unknown): string | null {
  const a = prayersOf(today);
  const b = prayersOf(tomorrow);
  if (!a || !b) return null;
  const clockShift = torontoOffsetMinutes(addDays(date, 1)) - torontoOffsetMinutes(date);
  for (const name of PRAYER_NAMES) {
    const ma = prayerMinutes(name, a.find((p) => p?.name === name)?.time);
    const mb = prayerMinutes(name, b.find((p) => p?.name === name)?.time);
    if (ma === null || mb === null) continue;
    if (Math.abs(mb - ma - clockShift) > MAX_DAILY_DRIFT_MIN) return `${name}_jump`;
  }
  return null;
}

export type Day = { date: string; payload: unknown };
export type Rejection = { date: string; reason: string };

/**
 * Picks the days that may be stored. A day is rejected if it is outside
 * [today, today + WINDOW_DAYS] or fails sourceProblem. Then every accepted
 * day is checked against its neighbours (accepted fetched days first,
 * else the stored row): a jump rejects the fetched day(s) of that pair,
 * since there is no telling which side is wrong. A rejected date simply
 * isn't written: its stored row (if any, validated earlier) stays.
 */
export function selectDays(
  fetched: Day[],
  stored: Map<string, unknown>,
  today: string,
): { accepted: Day[]; rejected: Rejection[] } {
  const rejected: Rejection[] = [];
  const candidates = new Map<string, Day>();
  const last = addDays(today, WINDOW_DAYS);

  for (const day of fetched) {
    if (typeof day?.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
      rejected.push({ date: String(day?.date), reason: "bad_date" });
    } else if (day.date < today || day.date > last) {
      rejected.push({ date: day.date, reason: "out_of_window" });
    } else if (candidates.has(day.date)) {
      rejected.push({ date: day.date, reason: "duplicate_date" });
    } else {
      const problem = sourceProblem(day.date, day.payload);
      if (problem) rejected.push({ date: day.date, reason: problem });
      else candidates.set(day.date, day);
    }
  }

  const neighbour = (date: string) => candidates.get(date)?.payload ?? stored.get(date);
  const broken = new Map<string, string>();
  for (const date of [...candidates.keys()].sort()) {
    const next = addDays(date, 1);
    const problem = continuityProblem(date, candidates.get(date)!.payload, neighbour(next));
    if (problem) {
      broken.set(date, problem);
      if (candidates.has(next)) broken.set(next, problem);
    }
    const previous = addDays(date, -1);
    if (!candidates.has(previous)) {
      const before = continuityProblem(previous, stored.get(previous), candidates.get(date)!.payload);
      if (before) broken.set(date, before);
    }
  }

  const accepted: Day[] = [];
  for (const date of [...candidates.keys()].sort()) {
    const reason = broken.get(date);
    if (reason) rejected.push({ date, reason });
    else accepted.push(candidates.get(date)!);
  }
  return { accepted, rejected };
}

// ── Eid ─────────────────────────────────────────────────────────────────

/** Eid is called only when no Eid data is stored or the last good call is a week old. */
export function eidDue(today: string, lastEidOkDate: string | null, storedEid: unknown): boolean {
  if (!storedEid || typeof storedEid !== "object") return true;
  if (!lastEidOkDate) return true;
  return daysBetween(lastEidOkDate, today) >= EID_REFRESH_DAYS;
}

/** Days without fetched Eid times get the stored ones (Eid isn't per day). */
export function withEid(days: Day[], storedEid: unknown): Day[] {
  return days.map((day) => {
    const payload = day.payload as Source;
    if (payload && typeof payload === "object" && payload.eidPrayerTimes == null && storedEid) {
      return { ...day, payload: { ...payload, eidPrayerTimes: storedEid } };
    }
    return day;
  });
}

// ── Alerts ──────────────────────────────────────────────────────────────

export type AlertInput = {
  today: string;
  /** Every stored date from today on, after this run's writes. */
  datesFromToday: string[];
  /** Monthly didn't succeed: Daily fallback used, or no usable answer at all. */
  monthlyFailed: boolean;
  /** Endpoints whose cap stopped a wanted call. */
  capsReached: string[];
};

/** The owner's alert list (2026-10-18); nothing else sends mail. */
export function alertReasons({ today, datesFromToday, monthlyFailed, capsReached }: AlertInput): string[] {
  const reasons: string[] = [];
  const dates = new Set(datesFromToday);
  if (!dates.has(today)) reasons.push(`Today's prayer_cache row (${today}) is missing.`);
  const horizon = [...dates].filter((d) => d >= today).sort().at(-1);
  const ahead = horizon ? daysBetween(today, horizon) : -1;
  if (ahead < MIN_HORIZON_DAYS) {
    reasons.push(horizon
      ? `Stored prayer times end on ${horizon}, ${ahead} day(s) ahead (alert below ${MIN_HORIZON_DAYS}).`
      : "No prayer times are stored from today on.");
  }
  if (monthlyFailed) reasons.push("Diyanet Monthly did not succeed this run (Daily fallback or no answer).");
  for (const endpoint of capsReached) reasons.push(`Call cap reached for ${endpoint}: the call was not made.`);
  return reasons;
}

// ── Comparing with what is stored ───────────────────────────────────────

/** JSON with sorted keys, so jsonb's key order doesn't count as a change. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export function changeKind(stored: unknown, fetched: unknown): "new" | "same" | "changed" {
  if (stored === undefined || stored === null) return "new";
  return canonical(stored) === canonical(fetched) ? "same" : "changed";
}

/**
 * A payload as flat "path → JSON value" lines, for dry-run reports. Prayer
 * lists are keyed by prayer name: "dailyPrayerTimes.Isha.time" → "\"7:55\"".
 */
export function flatten(value: unknown, path = "", out: Record<string, string> = {}): Record<string, string> {
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      const name = (item as Prayer | null)?.name;
      const named = typeof name === "string";
      if (named && item && typeof item === "object") {
        for (const [k, v] of Object.entries(item)) if (k !== "name") flatten(v, `${path}${name}.${k}.`, out);
      } else {
        flatten(item, `${path}${i}.`, out);
      }
    });
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) flatten(v, `${path}${k}.`, out);
  } else {
    out[path.replace(/\.$/, "")] = canonical(value);
  }
  return out;
}

/** The fields that differ between a stored and a fetched day, for dry-run reports. */
export function payloadDiff(stored: unknown, fetched: unknown): { field: string; from: string | null; to: string | null }[] {
  const a = flatten(stored ?? {});
  const b = flatten(fetched ?? {});
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .sort()
    .filter((k) => a[k] !== b[k])
    .map((k) => ({ field: k, from: a[k] ?? null, to: b[k] ?? null }));
}

/** Fajr / Maghrib / Isha start times and Jumu'ah of a day, for dry-run reports. */
export function daySummary(payload: unknown) {
  const prayers = prayersOf(payload) ?? [];
  const time = (name: string) => {
    const t = prayers.find((p) => p?.name === name)?.time;
    return typeof t === "string" ? t : null;
  };
  const jumaa = (payload as Source | null)?.jumaaPrayerTime;
  return { fajr: time("Fajr"), maghrib: time("Maghrib"), isha: time("Isha"), jumaa: typeof jumaa === "string" ? jumaa : null };
}
