// Displaying prayer_cache rows the way the app does (youth-toronto
// lib/shared/formatters.dart, lib/core/prayer_utils.dart). Pure: no I/O,
// unit-tested in display.test.ts.

import { PRAYER_NAMES, TZ, prayerMinutes } from "./range.ts";

export type PrayerItem = { name: string; time: string; iqamah: string | null };

/** The parts of a prayer_cache payload the site shows. */
export type PrayerDay = {
  date: string; // yyyy-MM-dd, the row's Toronto date key
  prayers: PrayerItem[]; // Fajr…Isha in timetable order
  jumuah: string | null; // the UPCOMING Friday's time (jumaaPrayerTime)
  hijriDate: string | null; // d.M.yyyy
  gregorianDate: string | null; // dd.MM.yyyy
};

/** Reads a stored payload; null when it has no usable timetable. */
export function parsePrayerDay(date: string, payload: unknown): PrayerDay | null {
  const p = payload as { dailyPrayerTimes?: unknown; jumaaPrayerTime?: unknown; hijriDate?: unknown; gregorianDate?: unknown } | null;
  if (!p || !Array.isArray(p.dailyPrayerTimes)) return null;
  const byName = new Map<string, PrayerItem>();
  for (const raw of p.dailyPrayerTimes as { name?: unknown; time?: unknown; iqamah?: unknown }[]) {
    if (typeof raw?.name !== "string" || typeof raw.time !== "string") continue;
    const iqamah = typeof raw.iqamah === "string" && raw.iqamah.trim() ? raw.iqamah.trim() : null;
    byName.set(raw.name, { name: raw.name, time: raw.time.trim(), iqamah });
  }
  const prayers = PRAYER_NAMES.map((n) => byName.get(n)).filter((x): x is PrayerItem => !!x);
  if (prayers.length !== PRAYER_NAMES.length) return null;
  const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  return { date, prayers, jumuah: s(p.jumaaPrayerTime), hijriDate: s(p.hijriDate), gregorianDate: s(p.gregorianDate) };
}

/**
 * "5:24 AM": prayer_cache mixes 24-hour morning times ("05:24") with 12-hour
 * afternoon ones without AM/PM ("1:16"); the prayer's name decides which
 * (prayerMinutes = the app's prayerClock). Unreadable values are shown as stored.
 */
export function prayerClock12(name: string, stored: string): string {
  const minutes = prayerMinutes(name, stored);
  if (minutes === null) return stored;
  const h24 = Math.floor(minutes / 60);
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(minutes % 60).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
}

/** Minutes since midnight on the Toronto clock at [at]. */
export function torontoMinutes(at: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return get("hour") * 60 + get("minute");
}

/**
 * The row to highlight (the app's currentTimetableRow): the last row whose
 * time has come, Sunrise included — from Sunrise until Dhuhr the Sunrise row
 * is highlighted, never Fajr. Before Fajr it is still the night's Isha.
 */
export function currentTimetableRow(prayers: PrayerItem[], nowMinutes: number): string | null {
  let current: string | null = null;
  for (const p of prayers) {
    const start = prayerMinutes(p.name, p.time);
    if (start !== null && start <= nowMinutes) current = p.name;
  }
  return current ?? (prayers.length ? prayers[prayers.length - 1].name : null);
}

/** "11.2.1448" → "11 Safer 1448"; null when unreadable. */
export function hijriTitle(raw: string | null, months: string[]): string | null {
  const m = raw ? /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(raw) : null;
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return `${Number(m[1])} ${months[month - 1]} ${m[3]}`;
}

/** A yyyy-MM-dd key as "26 Ekim Pazartesi" (the app's title pattern d MMMM EEEE). */
export function dayTitle(isoDate: string, locale: string): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  // Noon UTC: the same calendar date in every time zone.
  const at = new Date(Date.UTC(y, mo - 1, d, 12));
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...o }).format(at);
  return `${fmt({ day: "numeric", month: "long" })} ${fmt({ weekday: "long" })}`;
}
