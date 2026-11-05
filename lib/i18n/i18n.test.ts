import { test } from "node:test";
import assert from "node:assert/strict";
import { DATE_LOCALES, LANGS, localePath, routeRequest, stripLang } from "./config.ts";
import { clientMessages, getDict, resolveI18n } from "./index.ts";
import { dayTitle } from "../prayer/display.ts";

test("localePath: Turkish has no prefix", () => {
  assert.equal(localePath("tr", "/"), "/");
  assert.equal(localePath("tr", "/donation/success"), "/donation/success");
  assert.equal(localePath("en", "/"), "/en");
  assert.equal(localePath("fr", "/community?tab=duyurular"), "/fr/community?tab=duyurular");
});

test("stripLang", () => {
  assert.equal(stripLang("/en"), "/");
  assert.equal(stripLang("/fr/haberler/1"), "/haberler/1");
  assert.equal(stripLang("/tr/donation"), "/donation"); // the prerendered path of a Turkish page
  assert.equal(stripLang("/donation"), "/donation");
  assert.equal(stripLang("/english"), "/english");
});

test("routeRequest: Turkish URLs keep working without a prefix, whatever the cookie", () => {
  for (const cookie of [undefined, "tr", "en", "fr", "de"]) {
    assert.deepEqual(routeRequest("/donation", cookie, true), { kind: "rewrite", to: "/tr/donation" });
    assert.deepEqual(routeRequest("/community", cookie, true), { kind: "rewrite", to: "/tr/community" });
  }
});

test("routeRequest: only / follows the cookie, and only on a page load", () => {
  assert.deepEqual(routeRequest("/", "en", true), { kind: "redirect", to: "/en", status: 307 });
  assert.deepEqual(routeRequest("/", "fr", true), { kind: "redirect", to: "/fr", status: 307 });
  assert.deepEqual(routeRequest("/", "en", false), { kind: "rewrite", to: "/tr" });
  for (const cookie of [undefined, "tr", "de"]) assert.deepEqual(routeRequest("/", cookie, true), { kind: "rewrite", to: "/tr" });
});

test("routeRequest: prefixes", () => {
  assert.deepEqual(routeRequest("/en", "fr", true), { kind: "next" });
  assert.deepEqual(routeRequest("/fr/donation", "en", true), { kind: "next" });
  assert.deepEqual(routeRequest("/tr", undefined, true), { kind: "redirect", to: "/", status: 308 });
  assert.deepEqual(routeRequest("/tr/donation", "en", true), { kind: "redirect", to: "/donation", status: 308 });
  // Unknown languages are just unknown Turkish URLs, which end in the 404 page.
  assert.deepEqual(routeRequest("/de/donation", undefined, true), { kind: "rewrite", to: "/tr/de/donation" });
});

test("resolveI18n: selected, then English, then Turkish; blanks don't count", () => {
  assert.equal(resolveI18n({ tr: "T", en: "E", fr: "F" }, "fr"), "F");
  assert.equal(resolveI18n({ tr: "T", en: "E", fr: " " }, "fr"), "E");
  assert.equal(resolveI18n({ tr: "T" }, "fr"), "T");
  assert.equal(resolveI18n({ tr: "T", en: "E" }, "tr"), "T");
  assert.equal(resolveI18n(null, "en"), "");
});

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (typeof value === "function") return "function";
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  return typeof value;
}

test("every dictionary has the same keys and no empty text", () => {
  for (const lang of LANGS) {
    assert.deepEqual(shape(getDict(lang)), shape(getDict("tr")), lang);
    const walk = (v: unknown, path: string): void => {
      if (typeof v === "string") assert.ok(v.trim(), `${lang}: ${path}`);
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
    };
    walk(getDict(lang), "");
  }
});

test("the app's prayer names", () => {
  assert.deepEqual(Object.values(getDict("en").prayer.names), ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"]);
  assert.deepEqual(Object.values(getDict("fr").prayer.names), ["Fajr", "Lever du soleil", "Dhohr", "Asr", "Maghrib", "Icha"]);
  for (const lang of LANGS) assert.equal(getDict(lang).prayer.hijriMonths.length, 12);
});

test("client messages can cross to the browser (no functions)", () => {
  for (const lang of LANGS) assert.deepEqual(JSON.parse(JSON.stringify(clientMessages(lang))), clientMessages(lang));
});

test("day titles", () => {
  assert.equal(dayTitle("2026-10-26", DATE_LOCALES.tr), "26 Ekim Pazartesi");
  assert.equal(dayTitle("2026-10-26", DATE_LOCALES.en), "Monday, October 26");
  assert.equal(dayTitle("2026-10-26", DATE_LOCALES.fr), "lundi 26 octobre");
});
