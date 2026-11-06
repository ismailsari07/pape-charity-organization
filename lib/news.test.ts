import assert from "node:assert/strict";
import { test } from "node:test";
import { featuredNews, newsDate, newsParagraphs, newsSlides, parseNews, parsePhoto, type PublicNews } from "./news.ts";

const ID = "11111111-1111-4111-8111-111111111111";
const url = (b = "news-images") => `https://onczqxxdvmmmdcuhmyio.supabase.co/storage/v1/object/public/${b}/${ID}/${ID}.jpg`;
const photo = { url: url(), fit: "crop", width: 1280, height: 1600 };
const row = { id: ID, title: "T", body: "B", news_date: "2026-10-12", cover: photo, photos: [photo], is_featured: true, published_at: "2026-10-12T10:00:00Z" };

test("only photos in the news bucket pass", () => {
  assert.deepEqual(parsePhoto(photo), photo);
  assert.equal(parsePhoto({ ...photo, url: url("event-images") }), null);
  assert.equal(parsePhoto({ ...photo, url: "https://example.com/x.jpg" }), null);
  assert.equal(parsePhoto(null), null);
});

test("an empty alt is dropped and fit defaults to crop", () => {
  assert.deepEqual(parsePhoto({ ...photo, alt: " " }), photo);
  assert.equal(parsePhoto({ ...photo, fit: "x" })?.fit, "crop");
  assert.equal(parsePhoto({ ...photo, fit: "contain", alt: "Avlu" })?.alt, "Avlu");
});

test("a row needs a usable cover", () => {
  assert.equal(parseNews({ ...row, cover: null }), null);
  assert.equal(parseNews({ ...row, title: 1 }), null);
  assert.equal(parseNews(row)?.photos.length, 1);
  assert.equal(parseNews({ ...row, photos: [photo, { url: "bad" }] })?.photos.length, 1);
  assert.equal(parseNews({ ...row, photos: null })?.photos.length, 0);
});

test("the newest featured item goes first, none means null", () => {
  const n = (id: string, is_featured: boolean) => ({ ...parseNews(row)!, id, is_featured }) as PublicNews;
  assert.equal(featuredNews([n("a", false), n("b", true), n("c", true)])?.id, "b");
  assert.equal(featuredNews([n("a", false)]), null);
});

test("slides are the cover, then the gallery", () => {
  assert.equal(newsSlides({ cover: photo as never, photos: [photo, photo] as never }).length, 3);
});

test("the date is the stored day whatever the server's time zone", () => {
  assert.equal(newsDate("2026-10-12", "tr-TR"), "12 Ekim 2026");
  assert.equal(newsDate("2026-01-01", "tr-TR"), "1 Ocak 2026");
  assert.equal(newsDate("2026-10-12", "en-CA"), "October 12, 2026");
  assert.equal(newsDate("2026-10-12", "fr-CA"), "12 octobre 2026");
});

test("paragraphs split on blank lines", () => {
  assert.deepEqual(newsParagraphs("a\n\n b \n\n\nc\nd"), ["a", "b", "c\nd"]);
});
