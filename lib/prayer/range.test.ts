import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  addDays,
  alertReasons,
  changeKind,
  continuityProblem,
  daySummary,
  eidDue,
  payloadDiff,
  prayerMinutes,
  selectDays,
  sourceProblem,
  torontoDate,
  torontoOffsetMinutes,
  withEid,
  type Day,
} from "./range.ts";

// range-answer-2026-10-18.json: pape-api's GET /prayer-times/range answer
//   built from Diyanet's real Monthly response of 2026-10-19 03:47 UTC
//   (pape-api test/fixtures). The contract between the two repos.
// live-prayer-cache-*.json: source_payload of 16–18 Oct as stored in prayer_cache.
const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
const answer = fixture("range-answer-2026-10-18.json") as { days: Day[] };
const live = fixture("live-prayer-cache-2026-10-16-to-18.json") as Record<string, unknown>;

const TODAY = "2026-10-18";
const clone = <T>(v: T): T => structuredClone(v);
const dayOf = (date: string) => clone(answer.days.find((d) => d.date === date)!);
type P = { dailyPrayerTimes: { name: string; time: string; iqamah?: string }[]; [k: string]: unknown };
const setTime = (day: Day, name: string, time: string) => {
  (day.payload as P).dailyPrayerTimes.find((p) => p.name === name)!.time = time;
  return day;
};

test("Toronto calendar helpers", () => {
  assert.equal(torontoDate(new Date("2026-10-19T03:47:45Z")), "2026-10-18"); // the probe: evening in Toronto
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(torontoOffsetMinutes("2026-10-31"), -240);
  assert.equal(torontoOffsetMinutes("2026-11-01"), -300);
});

test("prayerMinutes reads pape-api's 12-hour afternoon times", () => {
  assert.equal(prayerMinutes("Fajr", "05:59"), 359);
  assert.equal(prayerMinutes("Dhuhr", "12:06"), 726);
  assert.equal(prayerMinutes("Dhuhr", "1:08"), 788);
  assert.equal(prayerMinutes("Asr", "2:49"), 889);
  assert.equal(prayerMinutes("Isha", "7:55"), 1195);
  assert.equal(prayerMinutes("Isha", "7:5"), null);
  assert.equal(prayerMinutes("Isha", undefined), null);
});

test("every day of the real Monthly answer is valid, and so are the stored rows", () => {
  for (const d of answer.days) assert.equal(sourceProblem(d.date, d.payload), null, d.date);
  for (const [date, source] of Object.entries(live)) assert.equal(sourceProblem(date, source), null, date);
});

test("sourceProblem rejects what must never be stored", () => {
  const base = dayOf("2026-10-20");
  const p = base.payload as P;
  const cases: [string, (p: P) => void, string][] = [
    ["a day keyed to another date (the old 1 Oct row)", (x) => (x.gregorianDate = "21.10.2026"), "date_mismatch"],
    ["a missing prayer", (x) => x.dailyPrayerTimes.splice(5, 1), "prayer_count"],
    ["prayers in the wrong order", (x) => x.dailyPrayerTimes.reverse(), "prayer_name_0"],
    ["Asr before Dhuhr", (x) => (x.dailyPrayerTimes[3].time = "12:30"), "out_of_order"],
    ["Fajr not zero-padded", (x) => (x.dailyPrayerTimes[0].time = "6:02"), "Fajr_time"],
    ["Isha without iqamah", (x) => delete x.dailyPrayerTimes[5].iqamah, "Isha_iqamah"],
    ["Sunrise with an iqamah", (x) => (x.dailyPrayerTimes[1].iqamah = "07:30"), "Sunrise_iqamah"],
    ["an unknown Jumu'ah time", (x) => (x.jumaaPrayerTime = "1:30"), "jumaa"],
  ];
  for (const [label, mutate, reason] of cases) {
    const copy = clone(p);
    mutate(copy);
    assert.equal(sourceProblem("2026-10-20", copy), reason, label);
  }
  assert.equal(sourceProblem("2026-10-20", null), "not_an_object");
});

test("continuity allows the DST hour but not a jump", () => {
  // 31 Oct → 1 Nov: every time moves back about an hour with the clocks.
  assert.equal(continuityProblem("2026-10-31", dayOf("2026-10-31").payload, dayOf("2026-11-01").payload), null);
  // An hour shift on an ordinary day is a broken day.
  const shifted = setTime(dayOf("2026-10-21"), "Fajr", "05:03");
  assert.equal(continuityProblem("2026-10-20", dayOf("2026-10-20").payload, shifted.payload), "Fajr_jump");
});

test("selectDays: the whole real answer is accepted for today on", () => {
  const { accepted, rejected } = selectDays(answer.days, new Map(), TODAY);
  assert.equal(accepted.length, 32);
  assert.deepEqual(rejected, []);
});

test("selectDays: a bad day is rejected alone; its stored row would stay", () => {
  const days = answer.days.map((d) => (d.date === "2026-10-25" ? setTime(clone(d), "Isha", "") : d));
  const { accepted, rejected } = selectDays(days, new Map(), TODAY);
  assert.deepEqual(rejected, [{ date: "2026-10-25", reason: "Isha_time" }]);
  assert.equal(accepted.length, 31);
  assert.ok(!accepted.some((d) => d.date === "2026-10-25"));
});

test("selectDays: a jump rejects both fetched days of the pair, nothing is guessed", () => {
  const days = answer.days.map((d) => (d.date === "2026-10-26" ? setTime(clone(d), "Maghrib", "7:25") : d));
  const { accepted, rejected } = selectDays(days, new Map(), TODAY);
  assert.deepEqual(rejected.map((r) => r.date).sort(), ["2026-10-25", "2026-10-26", "2026-10-27"]);
  assert.equal(accepted.length, 29);
});

test("selectDays: a single fetched day is checked against the stored neighbours", () => {
  const stored = new Map<string, unknown>([["2026-10-17", live["2026-10-17"]]]);
  assert.equal(selectDays([dayOf("2026-10-18")], stored, TODAY).accepted.length, 1);
  const shifted = setTime(dayOf("2026-10-18"), "Sunrise", "08:28");
  assert.deepEqual(selectDays([shifted], stored, TODAY).rejected, [{ date: "2026-10-18", reason: "Sunrise_jump" }]);
});

test("selectDays: only today to today + 40 are stored", () => {
  const { accepted, rejected } = selectDays(answer.days, new Map(), "2026-10-19");
  assert.deepEqual(rejected, [{ date: "2026-10-18", reason: "out_of_window" }]);
  assert.equal(accepted[0].date, "2026-10-19");
  const dup = selectDays([dayOf("2026-10-19"), dayOf("2026-10-19")], new Map(), "2026-10-19");
  assert.deepEqual(dup.rejected, [{ date: "2026-10-19", reason: "duplicate_date" }]);
});

test("Eid: called when missing or a week old, otherwise copied in", () => {
  const eid = (live["2026-10-18"] as P).eidPrayerTimes;
  assert.equal(eidDue(TODAY, null, eid), true);
  assert.equal(eidDue(TODAY, "2026-10-12", eid), false);
  assert.equal(eidDue(TODAY, "2026-10-11", eid), true);
  assert.equal(eidDue(TODAY, "2026-10-17", null), true);

  const filled = withEid([dayOf("2026-10-20")], eid);
  assert.deepEqual((filled[0].payload as P).eidPrayerTimes, eid);
  // With Eid copied in, the 18 Oct day equals what /prayer-times stored.
  assert.equal(changeKind(live["2026-10-18"], withEid([dayOf("2026-10-18")], eid)[0].payload), "same");
});

test("alerts: only the owner's four operational reasons", () => {
  const month = Array.from({ length: 31 }, (_, i) => addDays(TODAY, i));
  assert.deepEqual(alertReasons({ today: TODAY, datesFromToday: month, monthlyFailed: false, capsReached: [] }), []);

  const short = month.slice(0, 7); // horizon 6 days ahead
  const reasons = alertReasons({ today: TODAY, datesFromToday: short.slice(1), monthlyFailed: true, capsReached: ["eid"] });
  assert.equal(reasons.length, 4);
  assert.match(reasons[0], /Today's prayer_cache row \(2026-10-18\) is missing/);
  assert.match(reasons[1], /end on 2026-10-24, 6 day\(s\) ahead/);
  assert.match(reasons[2], /Monthly did not succeed/);
  assert.match(reasons[3], /Call cap reached for eid/);

  assert.deepEqual(
    alertReasons({ today: TODAY, datesFromToday: month.slice(0, 8), monthlyFailed: false, capsReached: [] }),
    [],
  ); // 7 days ahead: fine
});

test("changeKind ignores jsonb key order", () => {
  assert.equal(changeKind(undefined, {}), "new");
  assert.equal(changeKind({ a: 1, b: [1, { c: 2, d: 3 }] }, { b: [1, { d: 3, c: 2 }], a: 1 }), "same");
  assert.equal(changeKind({ a: 1 }, { a: 2 }), "changed");
});

test("dry-run report helpers: summary and field diff", () => {
  const nov1 = dayOf("2026-11-01");
  const { fajr, maghrib, isha, jumaa } = daySummary(nov1.payload);
  assert.equal(jumaa, "1:00");
  assert.ok(fajr && maghrib && isha);
  const eid = (live["2026-10-18"] as P).eidPrayerTimes;
  assert.deepEqual(payloadDiff(live["2026-10-18"], withEid([dayOf("2026-10-18")], eid)[0].payload), []);
  const before = dayOf("2026-10-20");
  const after = setTime(dayOf("2026-10-20"), "Isha", "7:59");
  const was = daySummary(before.payload).isha;
  assert.deepEqual(payloadDiff(before.payload, after.payload), [
    { field: "dailyPrayerTimes.Isha.time", from: JSON.stringify(was), to: '"7:59"' },
  ]);
});
