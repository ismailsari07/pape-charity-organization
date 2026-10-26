// youth_events on the mosque's clock (America/Toronto), ported from the app
// (youth-toronto lib/core/event_schedule.dart, lib/shared/formatters.dart).
// Pure: no I/O, unit-tested in schedule.test.ts.

import { TZ, addDays } from "../prayer/range.ts";

export type Recurrence = "none" | "weekly" | "biweekly" | "monthly";

/** The youth_events columns the site reads. */
export type YouthEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date_time: string; // timestamptz; for recurring events, the first session
  is_free: boolean;
  price: string | null; // stored as written, e.g. "$15"
  category: string;
  image_url: string | null; // public URL in event-images (1600×900)
  registration_link: string | null;
  registration_form: unknown; // in-app form, or null
  recurrence: string;
  starts_after_prayer: string | null; // fajr | dhuhr | asr | maghrib | isha
};

export const EVENT_COLUMNS =
  "id, title, description, location, date_time, is_free, price, category, image_url, registration_link, registration_form, recurrence, starts_after_prayer";

/** A wall-clock moment at the mosque. */
export type MosqueTime = { date: string; hour: number; minute: number }; // date = yyyy-MM-dd

export type UpcomingEvent = { event: YouthEvent; startsAt: MosqueTime };

export function recurrenceOf(e: YouthEvent): Recurrence {
  const r = e.recurrence?.trim().toLowerCase();
  return r === "weekly" || r === "biweekly" || r === "monthly" ? r : "none";
}

/** An instant as Toronto wall-clock time. */
export function toMosqueTime(at: Date): MosqueTime {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")), minute: Number(get("minute")) };
}

const ymd = (iso: string) => iso.split("-").map(Number) as [number, number, number];
const dayNumber = (iso: string) => {
  const [y, m, d] = ymd(iso);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};
const isoOf = (y: number, m: number, d: number) => {
  const at = new Date(Date.UTC(y, m - 1, d));
  return at.toISOString().slice(0, 10);
};

/** [start]'s day of the month, [months] later, clamped to that month's end (the app's _monthsAfter). */
function monthsAfter(start: string, months: number): string {
  const [y, m, d] = ymd(start);
  const lastDay = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  return isoOf(y, m + months, Math.min(d, lastDay));
}

/**
 * The session to show (the app's nextOccurrence): a one-off event's stored
 * start; a recurring one stepped forward by calendar dates (7/14 days or one
 * month) from its first session to the first one on or after [today], at the
 * first session's wall-clock time — dates, not 24 h steps, so DST never
 * shifts the time.
 */
export function nextOccurrence(e: YouthEvent, today: string): MosqueTime {
  const first = toMosqueTime(new Date(e.date_time));
  const rec = recurrenceOf(e);
  if (rec === "none" || first.date >= today) return first;

  let date: string;
  if (rec === "monthly") {
    const [fy, fm] = ymd(first.date);
    const [ty, tm] = ymd(today);
    let months = (ty - fy) * 12 + (tm - fm);
    date = monthsAfter(first.date, months);
    if (date < today) date = monthsAfter(first.date, ++months);
  } else {
    const step = rec === "weekly" ? 7 : 14;
    const days = dayNumber(today) - dayNumber(first.date);
    date = addDays(first.date, Math.ceil(days / step) * step);
  }
  return { date, hour: first.hour, minute: first.minute };
}

const compare = (a: MosqueTime, b: MosqueTime) => a.date.localeCompare(b.date) || a.hour - b.hour || a.minute - b.minute;

/** Every recurring event at its next session, one-off events from [today] on, soonest first. */
export function upcomingEvents(events: YouthEvent[], today: string): UpcomingEvent[] {
  return events
    .map((event) => ({ event, startsAt: nextOccurrence(event, today) }))
    .filter((u) => u.startsAt.date >= today)
    .sort((a, b) => compare(a.startsAt, b.startsAt));
}

/** "7:30 PM" — event times are 12-hour in every language, like the app. */
export function eventTime(t: MosqueTime): string {
  const h = t.hour % 12 === 0 ? 12 : t.hour % 12;
  return `${h}:${String(t.minute).padStart(2, "0")} ${t.hour >= 12 ? "PM" : "AM"}`;
}

/** 0 = Sunday … 6 = Saturday, of a yyyy-MM-dd date. */
export function weekdayOf(iso: string): number {
  const [y, m, d] = ymd(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Words the schedule line needs, from the dictionary. */
export type ScheduleWords = {
  everyWeekday: string[]; // indexed by weekdayOf: "Her Pazar", "Her Pazartesi", …
  everyTwoWeeks: string;
  monthly: string;
  afterPrayer: Record<string, string>; // "maghrib" → "akşam namazından sonra"
};

/**
 * The app's sessionLine: "Her Çarşamba · 7:30 PM", "28 Ekim Çarşamba · akşam
 * namazından sonra". A prayer-linked event never shows an estimated clock time.
 */
export function sessionLine(u: UpcomingEvent, words: ScheduleWords, shortDate: (iso: string) => string): string {
  const rec = recurrenceOf(u.event);
  const lead =
    rec === "weekly"
      ? words.everyWeekday[weekdayOf(u.startsAt.date)]
      : rec === "biweekly"
        ? words.everyTwoWeeks
        : rec === "monthly"
          ? words.monthly
          : shortDate(u.startsAt.date);
  const prayer = u.event.starts_after_prayer?.trim().toLowerCase();
  const when = prayer ? (words.afterPrayer[prayer] ?? prayer) : eventTime(u.startsAt);
  return `${lead} · ${when}`;
}
