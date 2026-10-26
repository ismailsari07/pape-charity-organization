import "server-only";
import { PUBLIC_ANNOUNCEMENT_COLUMNS, type PublicAnnouncement } from "@/lib/announcements";
import { publicClient } from "@/lib/server/public-client";
import { imageSize } from "@/lib/server/image-size";

// Public announcement reads for the website's server-rendered pages.
//
// RLS already limits anon to published, unexpired rows; the filters below
// repeat that so the result never depends on who is asking.
//
// The old lib/api/announcements.ts belongs to the old /admin and stays as is.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Published, unexpired announcements, newest published_at first, each with
 * its photo's natural size (cached per URL) for the cards. Throws on errors.
 */
export async function getActiveAnnouncements(): Promise<PublicAnnouncement[]> {
  const { data, error } = await publicClient()
    .from("announcements")
    .select(PUBLIC_ANNOUNCEMENT_COLUMNS)
    .eq("status", "published")
    .gt("expires_at", new Date().toISOString())
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  const rows = (data ?? []) as PublicAnnouncement[];
  return Promise.all(rows.map(async (a) => ({ ...a, image_size: a.image_url ? await imageSize(a.image_url) : null })));
}

/** One published, unexpired announcement; null when missing, archived, a draft, expired or a bad id. */
export async function getActiveAnnouncement(id: string): Promise<PublicAnnouncement | null> {
  if (!UUID_RE.test(id)) return null;

  const { data, error } = await publicClient()
    .from("announcements")
    .select(PUBLIC_ANNOUNCEMENT_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data as PublicAnnouncement | null;
}
