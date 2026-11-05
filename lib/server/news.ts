import "server-only";
import { unstable_cache } from "next/cache";
import { parseNews, PUBLIC_NEWS_COLUMNS, type PublicNews } from "@/lib/news";
import { publicClient } from "@/lib/server/public-client";

// Public news reads for the website's server-rendered pages. RLS already limits
// anon to published rows; the filter repeats that so the result never depends
// on who is asking. News never expires.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Newest first (the event's day, then publication). Kept 60 s in Next's data cache. Throws on errors. */
export const getPublishedNews = unstable_cache(fetchPublishedNews, ["published_news"], { revalidate: 60 });

async function fetchPublishedNews(): Promise<PublicNews[]> {
  const { data, error } = await publicClient()
    .from("mosque_news")
    .select(PUBLIC_NEWS_COLUMNS)
    .eq("status", "published")
    .order("news_date", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(parseNews).filter((n): n is PublicNews => n !== null);
}

/** One published item; null when missing, a draft or a bad id. */
export async function getPublishedNewsItem(id: string): Promise<PublicNews | null> {
  if (!UUID_RE.test(id)) return null;
  const { data, error } = await publicClient().from("mosque_news").select(PUBLIC_NEWS_COLUMNS).eq("id", id).eq("status", "published").maybeSingle();
  if (error) throw error;
  return data ? parseNews(data) : null;
}
