import { test } from "node:test";
import assert from "node:assert/strict";
import { nextOccurrence, sessionLine, toMosqueTime, upcomingEvents, type ScheduleWords, type YouthEvent } from "./schedule.ts";

const base: YouthEvent = {
  id: "x",
  title: "T",
  description: null,
  location: null,
  date_time: "2026-09-30T23:00:00+00:00", // Wed 30 Sep 2026, 7:00 PM EDT
  is_free: true,
  price: null,
  category: "community",
  image_url: null,
  registration_link: null,
  registration_form: null,
  recurrence: "weekly",
  starts_after_prayer: null,
};
const ev = (over: Partial<YouthEvent>): YouthEvent => ({ ...base, ...over });

test("toMosqueTime converts to Toronto wall time", () => {
  assert.deepEqual(toMosqueTime(new Date("2026-09-30T23:00:00Z")), { date: "2026-09-30", hour: 19, minute: 0 });
  assert.deepEqual(toMosqueTime(new Date("2026-12-01T00:30:00Z")), { date: "2026-11-30", hour: 19, minute: 30 });
});

test("weekly: next session on or after today keeps 7 PM across the DST change", () => {
  assert.deepEqual(nextOccurrence(base, "2026-10-26"), { date: "2026-10-28", hour: 19, minute: 0 });
  assert.deepEqual(nextOccurrence(base, "2026-10-28"), { date: "2026-10-28", hour: 19, minute: 0 }); // today stays listed
  assert.deepEqual(nextOccurrence(base, "2026-11-02"), { date: "2026-11-04", hour: 19, minute: 0 }); // after DST ends
});

test("biweekly and monthly (clamped to the month's end)", () => {
  assert.equal(nextOccurrence(ev({ recurrence: "biweekly" }), "2026-10-15").date, "2026-10-28");
  const jan31 = ev({ recurrence: "monthly", date_time: "2026-01-31T15:00:00Z" });
  assert.equal(nextOccurrence(jan31, "2026-04-02").date, "2026-04-30");
  assert.equal(nextOccurrence(jan31, "2026-05-01").date, "2026-05-31");
});

test("one-off events: future kept, past dropped, soonest first", () => {
  const past = ev({ id: "past", recurrence: "none", date_time: "2026-10-01T23:00:00Z" });
  const soon = ev({ id: "soon", recurrence: "none", date_time: "2026-10-27T16:00:00Z" });
  const list = upcomingEvents([base, past, soon], "2026-10-26");
  assert.deepEqual(list.map((u) => u.event.id), ["soon", "x"]);
});

const words: ScheduleWords = {
  everyWeekday: ["Her Pazar", "Her Pazartesi", "Her Salı", "Her Çarşamba", "Her Perşembe", "Her Cuma", "Her Cumartesi"],
  everyTwoWeeks: "İki haftada bir",
  monthly: "Her ay",
  afterPrayer: { maghrib: "akşam namazından sonra" },
};

test("sessionLine like the app", () => {
  const short = (iso: string) => `[${iso}]`;
  const [weekly] = upcomingEvents([base], "2026-10-26");
  assert.equal(sessionLine(weekly, words, short), "Her Çarşamba · 7:00 PM");
  const [linked] = upcomingEvents([ev({ starts_after_prayer: "maghrib" })], "2026-10-26");
  assert.equal(sessionLine(linked, words, short), "Her Çarşamba · akşam namazından sonra");
  const [once] = upcomingEvents([ev({ recurrence: "none", date_time: "2026-10-27T16:30:00Z" })], "2026-10-26");
  assert.equal(sessionLine(once, words, short), "[2026-10-27] · 12:30 PM");
});
