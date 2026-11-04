import { afterEach, before, after, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";
import { alertException, alertRecipients, sendAlerts, StepError } from "./alerts.ts";
import { runHealth } from "./health.ts";
import { rangeRefresh } from "./range-refresh.ts";
import { addDays, withEid, type Day } from "./range.ts";

// Every alert condition end to end: real rangeRefresh / runHealth / Resend SDK,
// against a fake Resend endpoint, a fake pape-api and an in-memory database.
// Nothing here reaches the network.

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
const answerDays = (fixture("range-answer-2026-10-18.json") as { days: Day[] }).days;
const eid = (fixture("live-prayer-cache-2026-10-16-to-18.json") as Record<string, { eidPrayerTimes: unknown }>)["2026-10-18"].eidPrayerTimes;
const TODAY = "2026-10-18";
const NOW = new Date("2026-10-18T08:00:00Z");
const WATCHDOG = new Date("2026-10-18T09:00:00Z");

// ── Fake Resend and pape-api ──────────────────────────────────────────────

type Mail = { from: string; to: string[]; subject: string; text: string };
let mails: Mail[] = [];
let resendStatus = 200;
let papeApi: () => { status: number; body: unknown } = () => okAnswer();
let servers: Server[] = [];
let papeUrl = "";

const listen = (handler: Parameters<typeof createServer>[1]) =>
  new Promise<string>((resolve) => {
    const server = createServer(handler).listen(0, "127.0.0.1", () => {
      servers.push(server);
      resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
    });
  });

before(async () => {
  process.env.RESEND_BASE_URL = await listen((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      res.setHeader("content-type", "application/json");
      res.statusCode = resendStatus;
      if (resendStatus === 200) {
        mails.push(JSON.parse(body));
        res.end('{"id":"fake"}');
      } else res.end('{"statusCode":500,"name":"internal_server_error","message":"fake failure"}');
    });
  });
  papeUrl = await listen((req, res) => {
    if (req.url === "/") return void res.end("ok");
    const { status, body } = papeApi();
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(body));
  });
});
after(() => servers.forEach((s) => s.close()));

beforeEach(() => {
  mails = [];
  resendStatus = 200;
  papeApi = () => okAnswer();
  process.env.ALERT_EMAIL = "one@example.com";
  process.env.RESEND_API_KEY = "re_fake";
});
afterEach(() => {
  delete process.env.ALERT_EMAIL;
  delete process.env.RESEND_API_KEY;
});

const okAnswer = (calls: unknown[] = [{ endpoint: "monthly", outcome: "ok", status: 200 }], days: Day[] = answerDays) => ({
  status: 200,
  body: { success: true, source: "monthly", days, rejected: [], calls, eid: { requested: false, fetched: false } },
});
const quota = { status: 406, code: "UPSTREAM_HTTP_ERROR" };

// ── In-memory database ────────────────────────────────────────────────────

type Row = Record<string, unknown>;
type DbOptions = {
  stored?: Day[];
  calls?: Row[];
  caps?: string[];
  fail?: Record<string, string>; // "prayer_cache", "rpc:ingest_prayer_days", ...
  claimFails?: boolean;
};

function fakeDb(options: DbOptions = {}) {
  const stored = options.stored ?? withEid(answerDays, eid);
  const tables: Record<string, Row[]> = {
    prayer_cache: stored.map((d) => ({ date: d.date, source_payload: d.payload, fetched_at: "2026-10-17T08:00:00Z", eid })),
    prayer_api_calls: options.calls ?? [{ called_at: "2026-10-17T08:00:00Z", endpoint: "eid", outcome: "ok", http_status: 200, dry_run: false }],
    prayer_alerts_sent: [],
  };
  const fail = options.fail ?? {};
  let nextId = 1000;

  const db = {
    tables,
    from(table: string) {
      const filters: ((r: Row) => boolean)[] = [];
      let op: "select" | "upsert" | "delete" = "select";
      let incoming: Row[] = [];
      let orderBy: { col: string; asc: boolean } | null = null;
      let limit = Infinity;
      const builder = {
        select: () => builder,
        gte: (c: string, v: string) => (filters.push((r) => String(r[c]) >= v), builder),
        eq: (c: string, v: unknown) => (filters.push((r) => r[c] === v), builder),
        neq: (c: string, v: unknown) => (filters.push((r) => r[c] !== v), builder),
        in: (c: string, v: unknown[]) => (filters.push((r) => v.includes(r[c])), builder),
        order: (col: string, o?: { ascending?: boolean }) => ((orderBy = { col, asc: o?.ascending !== false }), builder),
        limit: (n: number) => ((limit = n), builder),
        upsert: (rows: Row[]) => ((op = "upsert"), (incoming = rows), builder),
        delete: () => ((op = "delete"), builder),
        then(resolve: (v: unknown) => void) {
          if (fail[table] || (table === "prayer_alerts_sent" && options.claimFails)) {
            return resolve({ data: null, error: { message: fail[table] ?? "alerts table down" } });
          }
          const rows = tables[table];
          if (op === "upsert") {
            const added = incoming.filter((n) => !rows.some((r) => r.day === n.day && r.problem === n.problem));
            rows.push(...added);
            return resolve({ data: added, error: null });
          }
          if (op === "delete") {
            tables[table] = rows.filter((r) => !filters.every((f) => f(r)));
            return resolve({ data: null, error: null });
          }
          let out = rows.filter((r) => filters.every((f) => f(r)));
          if (orderBy) {
            const { col, asc } = orderBy;
            out = [...out].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : 1) * (asc ? 1 : -1));
          }
          return resolve({ data: out.slice(0, limit), error: null });
        },
      };
      return builder;
    },
    async rpc(name: string, args: Row) {
      if (fail[`rpc:${name}`]) return { data: null, error: { message: fail[`rpc:${name}`] } };
      if (name === "prayer_api_reserve") {
        if (options.caps?.includes(args.p_endpoint as string)) return { data: null, error: null };
        const id = nextId++;
        tables.prayer_api_calls.push({ id, called_at: NOW.toISOString(), endpoint: args.p_endpoint, outcome: "reserved", dry_run: args.p_dry_run });
        return { data: id, error: null };
      }
      if (name === "prayer_api_finish") {
        const row = tables.prayer_api_calls.find((r) => r.id === args.p_id)!;
        row.outcome = args.p_outcome;
        row.http_status = args.p_http_status;
        return { data: true, error: null };
      }
      if (name === "ingest_prayer_days") {
        return { data: { written: [], unchanged: (args.p_days as { date: string }[]).map((d) => d.date), rejected: [] }, error: null };
      }
      throw new Error(`unexpected rpc ${name}`);
    },
  };
  return db as typeof db & SupabaseClient;
}

const refresh = (db: SupabaseClient, dry = false) => rangeRefresh({ db, prayerApiUrl: `${papeUrl}/prayer-times`, dry, now: NOW });
const allDates = (n: number, from = TODAY) => Array.from({ length: n }, (_, i) => addDays(from, i));
const storedFor = (dates: string[]) => withEid(answerDays, eid).filter((d) => dates.includes(d.date));
const noAnswerDays = () => ({ status: 200, body: { success: true, source: "monthly", days: [], rejected: [], calls: [{ endpoint: "monthly", outcome: "ok", status: 200 }] } });
const types = (r: { alerts: { type: string }[] }) => r.alerts.map((a) => a.type);

// ── Refresh route: a healthy run ──────────────────────────────────────────

test("healthy refresh sends nothing", async () => {
  const report = await refresh(fakeDb());
  assert.equal(report.ok, true);
  assert.deepEqual(report.alerts, []);
  assert.equal(mails.length, 0);
});

test("Monthly's routine out_of_window row isn't an alert", async () => {
  const report = await rangeRefresh({ db: fakeDb(), prayerApiUrl: `${papeUrl}/x`, dry: false, now: new Date("2026-10-20T08:00:00Z") });
  assert.ok(report.rejected.some((r) => r.reason === "out_of_window"));
  assert.ok(!types(report).includes("days_rejected"));
});

// ── Refresh route: each failure ───────────────────────────────────────────

test("pape-api unreachable or failing: monthly_failed, with the reason", async () => {
  papeApi = () => ({ status: 504, body: { success: false, code: "ECONNRESET", message: "Auth/Login failed", status: null, calls: [] } });
  const report = await refresh(fakeDb());
  assert.deepEqual(types(report), ["monthly_failed"]);
  assert.equal(mails.length, 1);
  assert.match(mails[0].text, /Monthly did not succeed.*ECONNRESET/);
});

test("Monthly fails, Daily fallback answers: monthly_failed says so", async () => {
  papeApi = () => ({ status: 200, body: { success: true, source: "daily", days: [], rejected: [], calls: [{ endpoint: "monthly", outcome: "failed", status: 500 }, { endpoint: "daily", outcome: "ok", status: 200 }] } });
  await refresh(fakeDb());
  assert.match(mails[0].text, /Daily fallback stored today only/);
});

test("Diyanet 406 on Monthly: diyanet_quota, not monthly_failed and not our cap", async () => {
  papeApi = () => ({ status: 502, body: { success: false, code: "UPSTREAM_HTTP_ERROR", status: 406, upstreamLabel: "PrayerTime/Monthly", bodySnippet: "kota aşıldı", message: "HTTP 406", calls: [{ endpoint: "monthly", outcome: "failed", ...quota }] } });
  const report = await refresh(fakeDb());
  assert.deepEqual(types(report), ["diyanet_quota"]);
  assert.match(mails[0].text, /Diyanet refused .*own quota.*not our call cap/);
  assert.doesNotMatch(mails[0].text, /Our own call cap/);
});

test("Diyanet 406 on Eid: diyanet_quota; Monthly stays fine", async () => {
  const db = fakeDb({ calls: [{ called_at: "2026-10-01T08:00:00Z", endpoint: "eid", outcome: "ok", http_status: 200, dry_run: false }] });
  papeApi = () => okAnswer([{ endpoint: "monthly", outcome: "ok", status: 200 }, { endpoint: "eid", outcome: "failed", ...quota }]);
  const report = await refresh(db);
  assert.deepEqual(types(report), ["diyanet_quota"]);
  assert.match(mails[0].text, /refused eid/);
});

test("Eid fails for another reason: eid_failed", async () => {
  const db = fakeDb({ calls: [{ called_at: "2026-10-01T08:00:00Z", endpoint: "eid", outcome: "ok", http_status: 200, dry_run: false }] });
  papeApi = () => okAnswer([{ endpoint: "monthly", outcome: "ok", status: 200 }, { endpoint: "eid", outcome: "failed", status: 500 }]);
  const report = await refresh(db);
  assert.deepEqual(types(report), ["eid_failed"]);
});

test("our own cap on Monthly: call_cap_monthly, no call made, doesn't blame Diyanet", async () => {
  let called = false;
  papeApi = () => ((called = true), okAnswer());
  const report = await refresh(fakeDb({ caps: ["monthly"] }));
  assert.equal(called, false);
  assert.deepEqual(types(report), ["call_cap_monthly"]);
  assert.match(mails[0].text, /Our own call cap .*Diyanet did not refuse/);
});

test("our own cap on the Daily fallback: call_cap_daily", async () => {
  const report = await refresh(fakeDb({ caps: ["daily"] }));
  assert.deepEqual(types(report), ["call_cap_daily"]);
});

test("Eid held by our cap with a good last call: call_cap_eid", async () => {
  const report = await refresh(fakeDb({ caps: ["eid"], calls: [{ called_at: "2026-10-01T08:00:00Z", endpoint: "eid", outcome: "ok", http_status: 200, dry_run: false }] }));
  assert.deepEqual(types(report), ["call_cap_eid"]);
});

test("Eid retry waiting after a failed call: no misleading cap mail", async () => {
  const report = await refresh(fakeDb({
    caps: ["eid"],
    calls: [
      { called_at: "2026-10-01T08:00:00Z", endpoint: "eid", outcome: "ok", http_status: 200, dry_run: false },
      { called_at: "2026-10-16T08:00:00Z", endpoint: "eid", outcome: "failed", http_status: 406, dry_run: false },
    ],
  }));
  assert.deepEqual(report.alerts, []);
  assert.equal(mails.length, 0);
});

test("database write fails while data still looks fine: write_failed", async () => {
  const report = await refresh(fakeDb({ fail: { "rpc:ingest_prayer_days": "disk full" } }));
  assert.deepEqual(types(report), ["write_failed"]);
  assert.match(mails[0].text, /disk full/);
});

test("closing a counter row fails: counter_failed", async () => {
  const report = await refresh(fakeDb({ fail: { "rpc:prayer_api_finish": "boom" } }));
  assert.deepEqual(types(report), ["counter_failed"]);
});

test("a stored day is rejected: days_rejected names it", async () => {
  const days = structuredClone(answerDays);
  (days.find((d) => d.date === "2026-10-25")!.payload as { dailyPrayerTimes: unknown }).dailyPrayerTimes = [];
  papeApi = () => okAnswer(undefined, days);
  const report = await refresh(fakeDb());
  assert.ok(types(report).includes("days_rejected"));
  assert.match(mails[0].text, /2026-10-25/);
});

test("reading stored state or the counter throwing: typed for the route's catch-all", async () => {
  await assert.rejects(refresh(fakeDb({ fail: { prayer_cache: "read down" } })), (e: StepError) => e.type === "read_failed");
  await assert.rejects(refresh(fakeDb({ fail: { "rpc:prayer_api_reserve": "no counter" } })), (e: StepError) => e.type === "counter_failed");
});

test("the catch-all mails each kind of exception", async () => {
  const db = fakeDb();
  await alertException(new StepError("read_failed", "read down"), () => db, TODAY, "Prayer refresh");
  await alertException(new StepError("counter_failed", "no counter"), () => db, TODAY, "Prayer refresh");
  await alertException(new Error("surprise"), () => db, TODAY, "Prayer refresh");
  assert.equal(mails.length, 3);
  assert.match(mails[2].text, /Prayer refresh stopped: surprise/);
  // No database client at all: the mail still goes out.
  await alertException(new Error("surprise"), () => { throw new Error("no url"); }, TODAY, "Prayer refresh");
  assert.equal(mails.length, 4);
});

test("after a run with no data: today_missing, future_days_low and dates_missing", async () => {
  papeApi = noAnswerDays;
  const report = await refresh(fakeDb({ stored: [] }));
  assert.deepEqual(types(report), ["today_missing", "future_days_low", "dates_missing"]);
  assert.equal(mails.length, 1);
  assert.match(mails[0].subject, /3 problem\(s\) — 2026-10-18/);
});

test("dry run reports but never mails or claims", async () => {
  papeApi = () => ({ status: 504, body: { success: false, code: "X", calls: [] } });
  const db = fakeDb();
  const report = await refresh(db, true);
  assert.deepEqual(types(report), ["monthly_failed"]);
  assert.equal(mails.length, 0);
  assert.deepEqual(db.tables.prayer_alerts_sent, []);
});

// ── Once per type per day, recipients ─────────────────────────────────────

const one = (type: string, day = TODAY) => ({ day, source: "Test", problems: [{ type, message: `${type} text` }], detail: {} });

test("one email per problem type per day; another type or day still goes out", async () => {
  const db = fakeDb();
  assert.deepEqual((await sendAlerts({ db, ...one("write_failed") })).sent, ["write_failed"]);
  const again = await sendAlerts({ db, ...one("write_failed") });
  assert.deepEqual(again.suppressed, ["write_failed"]);
  assert.equal(mails.length, 1);
  await sendAlerts({ db, ...one("today_missing") });
  assert.equal(mails.length, 2);
  await sendAlerts({ db, ...one("write_failed", addDays(TODAY, 1)) });
  assert.equal(mails.length, 3);
});

test("a mixed run mails only the types not yet sent today", async () => {
  const db = fakeDb();
  await sendAlerts({ db, ...one("write_failed") });
  const r = await sendAlerts({ db, day: TODAY, source: "Test", detail: {}, problems: [{ type: "write_failed", message: "old" }, { type: "dates_missing", message: "new" }] });
  assert.deepEqual([r.sent, r.suppressed], [["dates_missing"], ["write_failed"]]);
  assert.match(mails[1].text, /new/);
  assert.doesNotMatch(mails[1].text, /old/);
  assert.match(mails[1].subject, /1 problem/);
});

test("the refresh and the watchdog share the daily limit", async () => {
  papeApi = noAnswerDays;
  const db = fakeDb({ stored: [] });
  await refresh(db);
  assert.equal(mails.length, 1);
  const health = await runHealth({ db, now: WATCHDOG, mode: "check", rangeEnabled: true });
  assert.deepEqual(health.alertResult?.sent, []);
  assert.equal(mails.length, 1);
});

test("a failed send frees the claim, so a later run retries", async () => {
  const db = fakeDb();
  resendStatus = 500;
  const failed = await sendAlerts({ db, ...one("write_failed") });
  assert.deepEqual(failed.failed, ["write_failed"]);
  assert.deepEqual(db.tables.prayer_alerts_sent, []);
  resendStatus = 200;
  assert.deepEqual((await sendAlerts({ db, ...one("write_failed") })).sent, ["write_failed"]);
  assert.equal(mails.length, 1);
});

test("the limit's table being down doesn't silence the alert", async () => {
  const r = await sendAlerts({ db: fakeDb({ claimFails: true }), ...one("write_failed") });
  assert.deepEqual(r.sent, ["write_failed"]);
  assert.equal(mails.length, 1);
});

test("ALERT_EMAIL: all comma-separated addresses receive it", async () => {
  process.env.ALERT_EMAIL = " one@example.com, two@example.com ,,three@example.com";
  assert.deepEqual(alertRecipients(), ["one@example.com", "two@example.com", "three@example.com"]);
  await sendAlerts({ db: fakeDb(), ...one("write_failed") });
  assert.deepEqual(mails[0].to, ["one@example.com", "two@example.com", "three@example.com"]);
});

test("no ALERT_EMAIL: nothing sent, and no claim that would block a later run", async () => {
  delete process.env.ALERT_EMAIL;
  const db = fakeDb();
  const r = await sendAlerts({ db, ...one("write_failed") });
  assert.deepEqual(r.failed, ["write_failed"]);
  assert.deepEqual(db.tables.prayer_alerts_sent, []);
  assert.equal(mails.length, 0);
});

// ── Watchdog ──────────────────────────────────────────────────────────────

const ranToday = [{ called_at: "2026-10-18T07:59:58Z", endpoint: "monthly", outcome: "ok", dry_run: false }];
const watchdog = (options: DbOptions, mode: "check" | "dry" | "test" = "check", rangeEnabled = true) =>
  runHealth({ db: fakeDb({ calls: ranToday, ...options }), now: WATCHDOG, mode, rangeEnabled });
const healthTypes = (r: { problems: { type: string }[] }) => r.problems.map((p) => p.type);

test("watchdog: all healthy, no mail", async () => {
  const r = await watchdog({});
  assert.equal(r.ok, true);
  assert.equal(r.futureDays >= 14, true);
  assert.equal(mails.length, 0);
});

test("watchdog: today's row missing", async () => {
  const r = await watchdog({ stored: storedFor(allDates(31, TODAY).slice(1)) });
  assert.deepEqual(healthTypes(r), ["today_missing"]);
  assert.equal(mails.length, 1);
});

test("watchdog: refresh missed today is caught at 09:00, when yesterday's run is 25 hours old", async () => {
  const r = await watchdog({ calls: [{ called_at: "2026-10-17T07:59:58Z", endpoint: "monthly", outcome: "ok", dry_run: false }] });
  assert.deepEqual(healthTypes(r), ["refresh_not_run"]);
  assert.match(mails[0].text, /No refresh ran/);
});

test("watchdog: only a dry run today doesn't count", async () => {
  const r = await watchdog({ calls: [{ called_at: "2026-10-18T08:30:00Z", endpoint: "monthly", outcome: "ok", dry_run: true }] });
  assert.deepEqual(healthTypes(r), ["refresh_not_run"]);
});

test("watchdog: a run that died mid-way (reservations left open)", async () => {
  const r = await watchdog({ calls: [{ called_at: "2026-10-18T07:59:58Z", endpoint: "monthly", outcome: "reserved", dry_run: false }] });
  assert.deepEqual(healthTypes(r), ["refresh_not_run"]);
  assert.match(mails[0].text, /started but never finished/);
});

test("watchdog: a run that found Diyanet down still counts as run", async () => {
  const r = await watchdog({ calls: [{ called_at: "2026-10-18T07:59:58Z", endpoint: "monthly", outcome: "not_called", dry_run: false }] });
  assert.equal(r.ok, true);
});

test("watchdog: fewer than 14 future days", async () => {
  const r = await watchdog({ stored: storedFor(allDates(14)) });
  assert.ok(healthTypes(r).includes("future_days_low"));
  assert.equal(r.futureDays, 13);
  assert.match(mails[0].text, /Only 13 future day/);
});

test("watchdog: a missing date inside the next 14 days, though plenty are stored", async () => {
  const r = await watchdog({ stored: storedFor(allDates(31).filter((d) => d !== "2026-10-25")) });
  assert.deepEqual(healthTypes(r), ["dates_missing"]);
  assert.match(mails[0].text, /2026-10-25/);
});

test("watchdog: a database read error is typed for the route's catch-all", async () => {
  await assert.rejects(watchdog({ fail: { prayer_cache: "down" } }), (e: StepError) => e.type === "read_failed");
  await assert.rejects(watchdog({ fail: { prayer_api_calls: "down" } }), (e: StepError) => e.type === "read_failed");
});

test("watchdog: one-day path has no run record, so the run check is skipped", async () => {
  const r = await watchdog({ calls: [] }, "check", false);
  assert.equal(r.ok, true);
});

test("watchdog dry mode reports without mail", async () => {
  const r = await watchdog({ calls: [] }, "dry");
  assert.deepEqual(healthTypes(r), ["refresh_not_run"]);
  assert.equal(mails.length, 0);
});

test("watchdog test mode mails everyone, whatever the state, and claims nothing", async () => {
  process.env.ALERT_EMAIL = "one@example.com,two@example.com";
  const db = fakeDb({ calls: ranToday });
  const r = await runHealth({ db, now: WATCHDOG, mode: "test", rangeEnabled: true });
  assert.equal(r.testSent, true);
  assert.deepEqual(mails[0].to, ["one@example.com", "two@example.com"]);
  assert.match(mails[0].subject, /test email/);
  assert.match(mails[0].text, /All checks pass/);
  assert.deepEqual(db.tables.prayer_alerts_sent, []);
});
