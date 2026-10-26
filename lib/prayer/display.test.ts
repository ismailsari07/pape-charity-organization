import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { currentTimetableRow, dayTitle, hijriTitle, parsePrayerDay, prayerClock12, torontoMinutes } from "./display.ts";

const MONTHS = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];

// A real row (live prayer_cache, 2026-10-16) from the refresh fixtures.
const fixture = JSON.parse(readFileSync(new URL("./fixtures/live-prayer-cache-2026-10-16-to-18.json", import.meta.url), "utf8"));
const firstRow = { date: "2026-10-16", payload: fixture["2026-10-16"] };

test("parsePrayerDay reads a live row in timetable order", () => {
  const day = parsePrayerDay(firstRow.date, firstRow.payload);
  assert.ok(day);
  assert.deepEqual(day.prayers.map((p) => p.name), ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]);
  assert.equal(day.prayers[1].iqamah, null);
  assert.ok(day.jumuah);
});

test("parsePrayerDay refuses a payload without the six prayers", () => {
  assert.equal(parsePrayerDay("2026-10-26", null), null);
  assert.equal(parsePrayerDay("2026-10-26", { dailyPrayerTimes: [{ name: "Fajr", time: "06:00" }] }), null);
});

test("prayerClock12 follows the app's rule by prayer name", () => {
  assert.equal(prayerClock12("Fajr", "05:44"), "5:44 AM");
  assert.equal(prayerClock12("Sunrise", "07:21"), "7:21 AM");
  assert.equal(prayerClock12("Dhuhr", "12:59"), "12:59 PM");
  assert.equal(prayerClock12("Dhuhr", "11:30"), "11:30 AM");
  assert.equal(prayerClock12("Dhuhr", "1:30"), "1:30 PM"); // Jumu'ah uses the Dhuhr rule
  assert.equal(prayerClock12("Asr", "4:45"), "4:45 PM");
  assert.equal(prayerClock12("Maghrib", "6:17"), "6:17 PM");
  assert.equal(prayerClock12("Isha", "20:45"), "8:45 PM"); // already 24-hour
  assert.equal(prayerClock12("Isha", "bad"), "bad");
});

const DAY = [
  { name: "Fajr", time: "06:00", iqamah: "06:30" },
  { name: "Sunrise", time: "07:30", iqamah: null },
  { name: "Dhuhr", time: "12:59", iqamah: "1:30" },
  { name: "Asr", time: "3:55", iqamah: "4:15" },
  { name: "Maghrib", time: "6:17", iqamah: "6:22" },
  { name: "Isha", time: "7:40", iqamah: "8:00" },
];

test("currentTimetableRow: Isha before Fajr, Sunrise until Dhuhr", () => {
  assert.equal(currentTimetableRow(DAY, 3 * 60), "Isha");
  assert.equal(currentTimetableRow(DAY, 6 * 60), "Fajr");
  assert.equal(currentTimetableRow(DAY, 9 * 60), "Sunrise");
  assert.equal(currentTimetableRow(DAY, 12 * 60 + 59), "Dhuhr");
  assert.equal(currentTimetableRow(DAY, 18 * 60 + 16), "Asr");
  assert.equal(currentTimetableRow(DAY, 23 * 60), "Isha");
});

test("hijriTitle and dayTitle", () => {
  assert.equal(hijriTitle("11.2.1448", MONTHS), "11 Safer 1448");
  assert.equal(hijriTitle("4.5.1448", MONTHS), "4 Cemaziyelevvel 1448");
  assert.equal(hijriTitle("1.13.1448", MONTHS), null);
  assert.equal(hijriTitle(null, MONTHS), null);
  assert.equal(dayTitle("2026-10-26", "tr-TR"), "26 Ekim Pazartesi");
});

test("torontoMinutes uses the Toronto clock across DST", () => {
  assert.equal(torontoMinutes(new Date("2026-10-26T16:05:00Z")), 12 * 60 + 5); // EDT, UTC-4
  assert.equal(torontoMinutes(new Date("2026-11-02T17:05:00Z")), 12 * 60 + 5); // EST, UTC-5
});
