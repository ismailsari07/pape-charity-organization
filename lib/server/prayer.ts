import "server-only";
import { addDays, torontoDate } from "@/lib/prayer/range";
import { parsePrayerDay, type PrayerDay } from "@/lib/prayer/display";
import { publicClient } from "@/lib/server/public-client";

/**
 * prayer_cache rows for today and tomorrow on the Toronto calendar, keyed by
 * date — never "the newest row" (prayer_cache holds ~30 future days). Both
 * days are sent so a page cached before midnight still shows the right day:
 * the browser picks the row whose date is today in Toronto. A missing or
 * unreadable day is simply absent. Throws when the query itself fails.
 */
export async function getPrayerDays(): Promise<{ today: string; days: PrayerDay[] }> {
  const today = torontoDate();
  const { data, error } = await publicClient()
    .from("prayer_cache")
    .select("date, payload")
    .in("date", [today, addDays(today, 1)])
    .order("date");
  if (error) throw error;
  const days = (data ?? []).flatMap((row) => {
    const day = parsePrayerDay(row.date as string, row.payload);
    return day ? [day] : [];
  });
  return { today, days };
}
