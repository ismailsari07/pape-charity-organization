// Camimizden Haberler, as the panel writes them (mosque_news) and the app shows
// them. Shared by server pages and client components: no data access here.

export type NewsFit = "crop" | "contain";
export type NewsPhoto = { url: string; fit: NewsFit; width: number; height: number; alt?: string };

export type PublicNews = {
  id: string;
  title: string;
  body: string;
  news_date: string; // yyyy-mm-dd, a Toronto day
  cover: NewsPhoto;
  photos: NewsPhoto[];
  is_featured: boolean;
  published_at: string | null;
};

export const PUBLIC_NEWS_COLUMNS = "id, title, body, news_date, cover, photos, is_featured, published_at";

const URL_RE =
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/news-images\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.jpg$/;

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Only a photo next/image is allowed to load; the database checks the same. */
export function parsePhoto(raw: unknown): NewsPhoto | null {
  if (!isObj(raw) || typeof raw.url !== "string" || !URL_RE.test(raw.url)) return null;
  if (typeof raw.width !== "number" || typeof raw.height !== "number") return null;
  const alt = typeof raw.alt === "string" && raw.alt.trim() ? raw.alt.trim() : undefined;
  return { url: raw.url, fit: raw.fit === "contain" ? "contain" : "crop", width: raw.width, height: raw.height, ...(alt ? { alt } : {}) };
}

/** A row as clients may show it; null without a usable cover (publishing requires one). */
export function parseNews(raw: unknown): PublicNews | null {
  if (!isObj(raw) || typeof raw.id !== "string" || typeof raw.title !== "string" || typeof raw.body !== "string" || typeof raw.news_date !== "string") return null;
  const cover = parsePhoto(raw.cover);
  if (!cover) return null;
  const photos = Array.isArray(raw.photos) ? raw.photos.map(parsePhoto).filter((p): p is NewsPhoto => p !== null) : [];
  return {
    id: raw.id,
    title: raw.title,
    body: raw.body,
    news_date: raw.news_date,
    cover,
    photos,
    is_featured: raw.is_featured === true,
    published_at: typeof raw.published_at === "string" ? raw.published_at : null,
  };
}

/** The newest featured item (rows arrive newest first); null when none is featured. */
export function featuredNews(rows: PublicNews[]): PublicNews | null {
  return rows.find((n) => n.is_featured) ?? null;
}

/** The viewer's slides: the cover, then the gallery. */
export function newsSlides(n: Pick<PublicNews, "cover" | "photos">): NewsPhoto[] {
  return [n.cover, ...n.photos];
}

/** "2026-10-12" → "12 Ekim 2026". The stored day as it is, no time zone involved. */
export function newsDate(key: string): string {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("tr-TR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
}

export function newsParagraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
