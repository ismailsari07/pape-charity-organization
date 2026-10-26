import "server-only";
import { torontoDate } from "@/lib/prayer/range";
import { EVENT_COLUMNS, toMosqueTime, upcomingEvents, type UpcomingEvent, type YouthEvent } from "@/lib/events/schedule";
import { publicClient } from "@/lib/server/public-client";

/**
 * The app's events query (youth-toronto events_news_service.dart): published
 * only (RLS hides drafts from anon too; filtered here so the result never
 * depends on who asks), one-off events from the start of today on the mosque
 * calendar, plus every recurring event whatever its first date. Which session
 * to show is worked out by upcomingEvents. Throws on errors.
 */
export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  const today = torontoDate();
  const startOfToday = mosqueMidnightUtc(today);
  const { data, error } = await publicClient()
    .from("youth_events")
    .select(EVENT_COLUMNS)
    .eq("is_published", true)
    .or(`date_time.gte.${startOfToday},recurrence.in.(weekly,biweekly,monthly)`)
    .order("date_time");
  if (error) throw error;
  return upcomingEvents((data ?? []) as YouthEvent[], today);
}

/** Midnight of a Toronto date as a UTC ISO instant (EDT/EST resolved by trying both offsets). */
function mosqueMidnightUtc(date: string): string {
  for (const offset of ["-04:00", "-05:00"]) {
    const at = new Date(`${date}T00:00:00${offset}`);
    const wall = toMosqueTime(at);
    if (wall.date === date && wall.hour === 0) return at.toISOString();
  }
  return new Date(`${date}T00:00:00-05:00`).toISOString();
}
