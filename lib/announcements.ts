// Public announcements, as the mobile app (youth-toronto) shows them.
// Shared by server pages and client components — no data access here.

export type PublicAnnouncement = {
  id: string;
  title: string;
  description: string;
  image_url: string | null; // full public URL in the announcement-images bucket
  image_alt_text: string | null;
  published_at: string | null;
  created_at: string;
};

// Same columns the app selects (lib/core/events_news_service.dart).
export const PUBLIC_ANNOUNCEMENT_COLUMNS =
  "id, title, description, image_url, image_alt_text, published_at, created_at";

/** Date shown to users: when it was published, else when it was created (as in the app). */
export function announcementDate(a: PublicAnnouncement): string {
  return new Date(a.published_at ?? a.created_at).toLocaleDateString("tr-TR", {
    timeZone: "America/Toronto",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Paragraphs split on blank lines, like the app's detail screen. */
export function announcementParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
