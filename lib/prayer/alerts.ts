import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import type { Problem } from "./range.ts";

// Alert email for the refresh route and the watchdog, at most one per problem
// type per Toronto day. A type is claimed in prayer_alerts_sent (pape-admin)
// before sending, and released if the send fails so a later run can retry.
// If the claim itself fails the mail still goes out: a database problem is
// what the alert is for, and only secret-checked callers get here.

const ALERT_FROM = "Pape Mosque prayer times <duyuru@papemosque.ca>";

/** A failed step of a run; `type` is its problem type. */
export class StepError extends Error {
  type: string;
  constructor(type: string, message: string) {
    super(message);
    this.name = "StepError";
    this.type = type;
  }
}

/** ALERT_EMAIL: one address or several, comma-separated. */
export function alertRecipients(value: string | undefined = process.env.ALERT_EMAIL): string[] {
  return (value ?? "").split(",").map((a) => a.trim()).filter(Boolean);
}

export async function deliver(subject: string, text: string): Promise<boolean> {
  const to = alertRecipients();
  const key = process.env.RESEND_API_KEY;
  if (to.length === 0 || !key) {
    console.error("[prayer/alerts] not sent: ALERT_EMAIL or RESEND_API_KEY missing", { subject });
    return false;
  }
  try {
    const { error } = await new Resend(key).emails.send({ from: ALERT_FROM, to, subject, text });
    if (error) {
      console.error("[prayer/alerts] send failed", { message: error.message });
      return false;
    }
    return true;
  } catch (err) {
    console.error("[prayer/alerts] send failed", { message: String((err as Error)?.message ?? err) });
    return false;
  }
}

/** The types this call may send: newly claimed today, or all of them if claiming failed. */
async function claim(db: SupabaseClient | null, day: string, types: string[]): Promise<{ claimed: string[]; held: boolean }> {
  if (!db) return { claimed: types, held: false };
  try {
    const { data, error } = await db
      .from("prayer_alerts_sent")
      .upsert(types.map((problem) => ({ day, problem })), { onConflict: "day,problem", ignoreDuplicates: true })
      .select("problem");
    if (error) throw new Error(error.message);
    return { claimed: (data ?? []).map((r) => r.problem as string), held: true };
  } catch (err) {
    console.error("[prayer/alerts] claim failed, sending anyway", { message: String((err as Error)?.message ?? err) });
    return { claimed: types, held: false };
  }
}

async function release(db: SupabaseClient, day: string, types: string[]) {
  try {
    const { error } = await db.from("prayer_alerts_sent").delete().eq("day", day).in("problem", types);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[prayer/alerts] release failed", { types, message: String((err as Error)?.message ?? err) });
  }
}

export type AlertResult = {
  /** Types mailed by this call. */
  sent: string[];
  /** Types already mailed today. */
  suppressed: string[];
  /** Types whose mail didn't go out; a later run may retry. */
  failed: string[];
};

export async function sendAlerts({
  db,
  day,
  source,
  problems,
  detail,
}: {
  db: SupabaseClient | null;
  day: string;
  source: string;
  problems: Problem[];
  detail: Record<string, unknown>;
}): Promise<AlertResult> {
  const types = [...new Set(problems.map((p) => p.type))];
  if (types.length === 0) return { sent: [], suppressed: [], failed: [] };

  // Without a way to send, keep the claims free for a run that has one.
  if (alertRecipients().length === 0 || !process.env.RESEND_API_KEY) {
    console.error("[prayer/alerts] not sent: ALERT_EMAIL or RESEND_API_KEY missing", { types });
    return { sent: [], suppressed: [], failed: types };
  }

  const { claimed, held } = await claim(db, day, types);
  const suppressed = types.filter((t) => !claimed.includes(t));
  if (claimed.length === 0) return { sent: [], suppressed, failed: [] };

  const lines = problems.filter((p) => claimed.includes(p.type)).map((p) => `- ${p.message}`);
  const text = [`${source} needs attention:`, "", ...lines, "", `Run: ${JSON.stringify(detail, null, 2)}`].join("\n");
  const ok = await deliver(`Prayer times: ${lines.length} problem(s) — ${day}`, text);
  if (ok) return { sent: claimed, suppressed, failed: [] };
  if (held && db) await release(db, day, claimed);
  return { sent: [], suppressed, failed: claimed };
}

/** The catch-all of a route: reports `err` by its step, or as an unexpected exception. */
export async function alertException(err: unknown, makeDb: () => SupabaseClient, day: string, source: string): Promise<AlertResult> {
  let db: SupabaseClient | null = null;
  try {
    db = makeDb();
  } catch {
    /* the mail is still worth trying */
  }
  const type = err instanceof StepError ? err.type : "refresh_exception";
  const message = String((err as Error)?.message ?? err);
  return sendAlerts({ db, day, source, problems: [{ type, message: `${source} stopped: ${message}` }], detail: { today: day, type } });
}
