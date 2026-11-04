import { NextResponse } from "next/server";
import { alertException } from "@/lib/prayer/alerts";
import { runHealth, type Mode } from "@/lib/prayer/health";
import { torontoDate } from "@/lib/prayer/range";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Called by pg_cron through prayer_watchdog_kick() (pape-admin). The secret is
// generated in the database's Vault and checked there, so it lives nowhere else.
// ?dry=1 reports without mail; ?test=1 sends one test email.
export async function POST(req: Request) {
  const db = createAdminClient();

  // A failed check sends no mail: this point is open to anonymous callers.
  const { data: allowed, error } = await db.rpc("prayer_watchdog_verify", { p_secret: req.headers.get("x-watchdog-secret") ?? "" });
  if (error) {
    console.error("[prayer/health] secret check failed", { code: error.code, message: error.message });
    return NextResponse.json({ error: "secret_check_failed" }, { status: 503 });
  }
  if (allowed !== true) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const query = new URL(req.url).searchParams;
  const mode: Mode = query.get("test") === "1" ? "test" : query.get("dry") === "1" ? "dry" : "check";
  try {
    return NextResponse.json(await runHealth({ db, mode, rangeEnabled: process.env.PRAYER_RANGE_ENABLED === "true" }));
  } catch (err) {
    console.error("[prayer/health] check failed", { message: String((err as Error)?.message ?? err) });
    if (mode === "check") await alertException(err, () => db, torontoDate(), "Prayer watchdog");
    return NextResponse.json({ error: "check_failed", detail: String((err as Error)?.message ?? err) }, { status: 500 });
  }
}
