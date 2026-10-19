import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  addDays,
  alertReasons,
  changeKind,
  daySummary,
  eidDue,
  payloadDiff,
  selectDays,
  torontoDate,
  withEid,
  type Day,
  type Rejection,
} from "./range";

// The 30-day refresh (PRAYER_RANGE_ENABLED, or ?dry=1): one pape-api
// /prayer-times/range call per run, Diyanet calls counted and capped in
// prayer_api_calls (pape-admin M4), days validated (./range.ts) and stored in
// one transaction by ingest_prayer_days (M2). Dry runs do everything except
// writing prayer_cache and sending mail; their Diyanet calls are real, so they
// are counted (dry_run = true).

type Endpoint = "monthly" | "eid" | "daily";
type CallRecord = { endpoint: Endpoint; outcome: "ok" | "failed"; status: number | null };
type RangeAnswer = {
  success: boolean;
  source?: "monthly" | "daily";
  days?: Day[];
  rejected?: { row: string | null; reason: string }[];
  calls?: CallRecord[];
  eid?: { requested: boolean; fetched: boolean };
  code?: string;
  message?: string;
};

const WARMUP_TIMEOUT_MS = 90_000; // Render free tier cold start
const RANGE_TIMEOUT_MS = 60_000; // pape-api's own deadline is 25 s
const ALERT_FROM = "Pape Mosque prayer times <duyuru@papemosque.ca>";

export function rangeUrl(prayerApiUrl: string): string {
  return `${prayerApiUrl.replace(/\/+$/, "")}/range`;
}

async function fetchJson(url: string, timeoutMs: number): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Accept: "application/json", "User-Agent": "prayer-refresh/2.0" },
  });
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* not JSON */
  }
  return { status: res.status, body };
}

class Counter {
  private ids = new Map<Endpoint, number>();
  readonly capsReached: Endpoint[] = [];

  constructor(private db: SupabaseClient, private runId: string, private dry: boolean) {}

  /** true = the call may be made; false = cap reached (recorded for the alert). */
  async reserve(endpoint: Endpoint): Promise<boolean> {
    const { data, error } = await this.db.rpc("prayer_api_reserve", {
      p_endpoint: endpoint,
      p_run_id: this.runId,
      p_dry_run: this.dry,
    });
    // No counter, no Diyanet call.
    if (error) throw new Error(`prayer_api_reserve failed: ${error.message}`);
    if (data === null) {
      this.capsReached.push(endpoint);
      return false;
    }
    this.ids.set(endpoint, Number(data));
    return true;
  }

  /**
   * Closes every reservation. With pape-api's `calls` list we know exactly
   * what was called; without an answer, anything reserved may have been.
   */
  async finish(calls: CallRecord[] | null) {
    for (const [endpoint, id] of this.ids) {
      const call = calls?.find((c) => c.endpoint === endpoint);
      const outcome = call ? call.outcome : calls ? "not_called" : "unknown";
      const { error } = await this.db.rpc("prayer_api_finish", {
        p_id: id,
        p_outcome: outcome,
        p_http_status: call?.status ?? null,
      });
      if (error) console.error("[prayer/refresh] prayer_api_finish failed", { endpoint, message: error.message });
    }
  }
}

async function storedContext(db: SupabaseClient, today: string) {
  const [rows, eidRows, lastEid, firstCall] = await Promise.all([
    db.from("prayer_cache").select("date, source_payload").gte("date", addDays(today, -1)).order("date"),
    db
      .from("prayer_cache")
      .select("date, fetched_at, eid:source_payload->eidPrayerTimes")
      .order("date", { ascending: false })
      .limit(60),
    db
      .from("prayer_api_calls")
      .select("called_at")
      .eq("endpoint", "eid")
      .eq("outcome", "ok")
      .order("called_at", { ascending: false })
      .limit(1),
    db.from("prayer_api_calls").select("called_at").order("called_at").limit(1),
  ]);
  for (const r of [rows, eidRows, lastEid, firstCall]) {
    if (r.error) throw new Error(`reading stored state failed: ${r.error.message}`);
  }
  const stored = new Map<string, unknown>((rows.data ?? []).map((r) => [r.date as string, r.source_payload]));
  const withEidRows = (eidRows.data ?? []).filter((r) => r.eid && typeof r.eid === "object");
  const storedEid = withEidRows[0]?.eid ?? null;
  // Before prayer_api_calls has an ok Eid call, the one-day path's rows show
  // when Eid was last fetched (it fetched Eid on every run). Only rows written
  // before the counter's first entry count: later rows may carry copied Eid.
  let lastEidAt = lastEid.data?.[0]?.called_at as string | undefined;
  if (!lastEidAt) {
    const counterStart = firstCall.data?.[0]?.called_at as string | undefined;
    lastEidAt = withEidRows
      .map((r) => r.fetched_at as string)
      .filter((at) => at && (!counterStart || Date.parse(at) < Date.parse(counterStart)))
      .sort()
      .at(-1);
  }
  return { stored, storedEid, lastEidOkDate: lastEidAt ? torontoDate(new Date(lastEidAt)) : null };
}

async function sendAlert(reasons: string[], detail: Record<string, unknown>) {
  const to = process.env.ALERT_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (!to || !key) {
    console.error("[prayer/refresh] alert not sent: ALERT_EMAIL or RESEND_API_KEY missing", { reasons });
    return false;
  }
  const text = [
    "The prayer-time refresh needs attention:",
    "",
    ...reasons.map((r) => `- ${r}`),
    "",
    `Run: ${JSON.stringify(detail, null, 2)}`,
  ].join("\n");
  const { error } = await new Resend(key).emails.send({
    from: ALERT_FROM,
    to,
    subject: `Prayer times: ${reasons.length} problem(s) — ${detail.today}`,
    text,
  });
  if (error) {
    console.error("[prayer/refresh] alert email failed", { message: error.message });
    return false;
  }
  return true;
}

export async function rangeRefresh({ db, prayerApiUrl, dry }: { db: SupabaseClient; prayerApiUrl: string; dry: boolean }) {
  const startedAt = Date.now();
  const runId = crypto.randomUUID();
  const today = torontoDate();
  const { stored, storedEid, lastEidOkDate } = await storedContext(db, today);
  const counter = new Counter(db, runId, dry);

  const wantEid = eidDue(today, lastEidOkDate, storedEid) && (await counter.reserve("eid"));
  const monthlyAllowed = await counter.reserve("monthly");
  const fallbackAllowed = monthlyAllowed && (await counter.reserve("daily"));

  let answer: RangeAnswer | null = null;
  let httpStatus: number | null = null;
  let failure: string | null = null;

  if (monthlyAllowed) {
    const url = rangeUrl(prayerApiUrl);
    // Wake the Render instance first; "/" makes no Diyanet call.
    await fetchJson(new URL("/", url).toString(), WARMUP_TIMEOUT_MS).catch(() => null);
    try {
      const res = await fetchJson(`${url}?eid=${wantEid ? 1 : 0}&fallback=${fallbackAllowed ? 1 : 0}`, RANGE_TIMEOUT_MS);
      httpStatus = res.status;
      const body = res.body as RangeAnswer | null;
      if (body && Array.isArray(body.calls)) answer = body;
      if (!body?.success) failure = `pape-api ${res.status}: ${body?.code ?? "no body"} ${body?.message ?? ""}`.trim();
    } catch (err) {
      failure = `pape-api unreachable: ${String((err as Error)?.message ?? err)}`;
    }
  } else {
    failure = "monthly call cap reached";
  }
  await counter.finish(answer?.calls ?? (monthlyAllowed ? null : []));

  const fetched = answer?.success ? withEid(answer.days ?? [], storedEid) : [];
  const { accepted, rejected } = selectDays(fetched, stored, today);
  const upstreamRejected: Rejection[] = (answer?.rejected ?? []).map((r) => ({ date: String(r.row), reason: `pape-api:${r.reason}` }));

  let written: string[] = [];
  let unchanged: string[] = [];
  let dbRejected: Rejection[] = [];
  let writeError: string | null = null;
  let changes: Record<string, string> | undefined;
  let preview: Record<string, unknown>[] | undefined;

  if (dry) {
    changes = Object.fromEntries(accepted.map((d) => [d.date, changeKind(stored.get(d.date), d.payload)]));
    preview = accepted.map((d) => ({
      date: d.date,
      ...daySummary(d.payload),
      change: changeKind(stored.get(d.date), d.payload),
      diff: stored.has(d.date) ? payloadDiff(stored.get(d.date), d.payload) : undefined,
    }));
  } else if (accepted.length > 0) {
    const { data, error } = await db.rpc("ingest_prayer_days", {
      p_days: accepted.map((d) => ({ date: d.date, source: d.payload })),
    });
    if (error) {
      writeError = error.message;
      console.error("[prayer/refresh] ingest_prayer_days failed", { code: error.code, message: error.message });
    } else {
      written = data?.written ?? [];
      unchanged = data?.unchanged ?? [];
      dbRejected = data?.rejected ?? [];
    }
  }

  // Alerts look at what is stored after this run (for a dry run: what would be).
  let datesFromToday: string[];
  if (dry) {
    datesFromToday = [...new Set([...[...stored.keys()], ...accepted.map((d) => d.date)])].filter((d) => d >= today);
  } else {
    const { data, error } = await db.from("prayer_cache").select("date").gte("date", today);
    if (error) throw new Error(`reading prayer_cache after the write failed: ${error.message}`);
    datesFromToday = (data ?? []).map((r) => r.date as string);
  }
  const monthlyFailed = monthlyAllowed && answer?.source !== "monthly";
  const alerts = alertReasons({ today, datesFromToday, monthlyFailed, capsReached: counter.capsReached });

  const report = {
    ok: !failure && !writeError,
    mode: "range" as const,
    dry,
    runId,
    today,
    source: answer?.source ?? null,
    eid: { due: eidDue(today, lastEidOkDate, storedEid), lastOkDate: lastEidOkDate, requested: wantEid, fetched: answer?.eid?.fetched ?? false },
    calls: answer?.calls ?? null,
    capsReached: counter.capsReached,
    fetchedDays: fetched.length,
    accepted: accepted.length,
    written,
    unchanged,
    rejected: [...upstreamRejected, ...rejected, ...dbRejected],
    changes,
    preview,
    failure,
    writeError,
    alerts,
    alertSent: false,
    tookMs: Date.now() - startedAt,
  };

  if (alerts.length > 0 && !dry) {
    report.alertSent = await sendAlert(alerts, {
      today,
      runId,
      failure,
      writeError,
      httpStatus,
      source: report.source,
      written: written.length,
      rejected: report.rejected,
    });
  }
  if (report.rejected.length > 0) console.warn("[prayer/refresh] rejected days", report.rejected);
  if (failure) console.error("[prayer/refresh] range fetch failed", { failure, httpStatus });

  return report;
}
