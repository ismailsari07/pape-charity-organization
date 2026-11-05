import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFunds } from "./parse.ts";

const row = (o: Record<string, unknown>) => ({ slug: "zekat", title: "Zekât", description: "Metin", is_active: true, ...o });

test("reads the Turkish text from the i18n columns", () => {
  assert.deepEqual(
    parseFunds([row({ title_i18n: { tr: "Zekât TR", en: "Zakat", fr: "Zakat FR" }, description_i18n: { tr: "Açıklama", en: "Text" } })]),
    [{ slug: "zekat", title: "Zekât TR", description: "Açıklama" }],
  );
});

test("falls back to the plain columns", () => {
  assert.deepEqual(parseFunds([row({})]), [{ slug: "zekat", title: "Zekât", description: "Metin" }]);
  assert.deepEqual(parseFunds([row({ title_i18n: null, description_i18n: null })]), [{ slug: "zekat", title: "Zekât", description: "Metin" }]);
});

test("no description stays undefined", () => {
  assert.equal(parseFunds([row({ title_i18n: { tr: "Z" }, description_i18n: null, description: "" })])[0]?.description, undefined);
});

test("skips inactive funds, the holding fund, and rows without a usable slug or title", () => {
  assert.deepEqual(
    parseFunds([
      row({ is_active: false }),
      row({ is_active: null }),
      row({ slug: "unassigned" }),
      row({ slug: "Zekat" }),
      row({ slug: "a b" }),
      row({ slug: null }),
      row({ title: "  ", title_i18n: null }),
    ]),
    [],
  );
});

test("keeps the order it was given", () => {
  assert.deepEqual(parseFunds([row({ slug: "b" }), row({ slug: "a" })]).map((f) => f.slug), ["b", "a"]);
});
