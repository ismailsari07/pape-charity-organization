import type { SupabaseClient } from "@supabase/supabase-js";
import { deliver, sendAlerts, StepError, type AlertResult } from "./alerts.ts";
import { dataProblems, torontoDate, type Problem } from "./range.ts";

// The watchdog behind /api/prayer/health. Supabase pg_cron calls it at 09:00 UTC,
// so it still reports when the Vercel cron never fires, can't authenticate or dies.

/**
 * The refresh runs about 08:00 UTC. At 09:00 yesterday's run is 25 h old, so
 * any window over 25 h would pass a day whose refresh never happened.
 */
export const MAX_REFRESH_AGE_HOURS = 24;
/** A reservation still open this long after a run started: the run died. */
const UNFINISHED_AFTER_MS = 10 * 60_000;

export type Mode = "check" | "dry" | "test";

export async function healthProblems(db: SupabaseClient, now: Date, rangeEnabled: boolean): Promise<{ today: string; futureDays: number; problems: Problem[] }> {
  const today = torontoDate(now);
  const rows = await db.from("prayer_cache").select("date").gte("date", today);
  if (rows.error) throw new StepError("read_failed", `reading prayer_cache failed: ${rows.error.message}`);
  const dates = (rows.data ?? []).map((r) => r.date as string);
  const problems = dataProblems(today, dates);

  // Only the 30-day path records its runs; the one-day path has no trace to check.
  if (rangeEnabled) {
    const since = new Date(now.getTime() - MAX_REFRESH_AGE_HOURS * 3_600_000).toISOString();
    const calls = await db.from("prayer_api_calls").select("called_at, outcome").eq("dry_run", false).gte("called_at", since);
    if (calls.error) throw new StepError("read_failed", `reading prayer_api_calls failed: ${calls.error.message}`);
    const rowsSeen = calls.data ?? [];
    const finished = rowsSeen.some((c) => c.outcome !== "reserved" || now.getTime() - Date.parse(c.called_at as string) < UNFINISHED_AFTER_MS);
    if (rowsSeen.length === 0) {
      problems.push({ type: "refresh_not_run", message: `No refresh ran in the last ${MAX_REFRESH_AGE_HOURS} hours. Check the Vercel cron and CRON_SECRET.` });
    } else if (!finished) {
      problems.push({ type: "refresh_not_run", message: "A refresh started but never finished: the function probably died." });
    }
  }
  return { today, futureDays: dates.filter((d) => d > today).length, problems };
}

export async function runHealth({ db, now = new Date(), mode, rangeEnabled }: { db: SupabaseClient; now?: Date; mode: Mode; rangeEnabled: boolean }) {
  const { today, futureDays, problems } = await healthProblems(db, now, rangeEnabled);
  let alertResult: AlertResult | null = null;
  let testSent = false;

  if (mode === "test") {
    const state = problems.length === 0 ? "All checks pass." : problems.map((p) => `- ${p.message}`).join("\n");
    testSent = await deliver(`Prayer times watchdog: test email — ${today}`, `This is a test of the prayer-time watchdog. No action is needed.\n\n${state}`);
  } else if (mode === "check" && problems.length > 0) {
    alertResult = await sendAlerts({ db, day: today, source: "Prayer watchdog", problems, detail: { today, futureDays } });
  }
  return { ok: problems.length === 0, mode, today, futureDays, problems, alertResult, testSent };
}
