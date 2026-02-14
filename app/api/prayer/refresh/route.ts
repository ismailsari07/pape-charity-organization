import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const PRAYER_API_URL = process.env.PRAYER_API_URL!;
const CRON_SECRET = process.env.CRON_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TZ = "America/Toronto";
function todayInToronto(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`; // yyyy-MM-dd
}

async function fetchWithTimeout(url: string, ms = 60000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "prayer-refresh/1.0",
        Accept: "application/json",
      },
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function fetchWithRetry(url: string, timeoutsMs = [45000, 60000, 90000]) {
  let lastErr: any = null;
  for (let i = 0; i < timeoutsMs.length; i++) {
    try {
      const res = await fetchWithTimeout(url, timeoutsMs[i]);
      if (!res.ok) throw new Error(`upstream status ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      // küçük artan bekleme (1s, 2s, 3s…)
      await new Promise((r) => setTimeout(r, (i + 1) * 1000));
    }
  }
  throw lastErr ?? new Error("fetch failed");
}

function minimalValidatePayload(payload: unknown) {
  if (payload && typeof payload === "object") return true; // yalın doğrulama: boş/undefined olmasın
  return false;
}

function extractCronSecret(req: Request): string | null {
  // 1) x-cron-secret
  const h = req.headers.get("x-cron-secret");
  if (h) return h;

  // 2) Authorization: Bearer <token>
  const auth = req.headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  // 3) ?cron_secret=...
  const url = new URL(req.url);
  const qs = url.searchParams.get("cron_secret");
  if (qs) return qs;

  return null;
}

export async function POST(req: Request) {
  try {
    // 1) Güvenlik: secret header kontrolü
    const provided = extractCronSecret(req);
    if (!CRON_SECRET) {
      return NextResponse.json({ error: "server misconfig: CRON_SECRET missing" }, { status: 500 });
    }

    if (provided !== CRON_SECRET) {
      console.log("cron provided len:", provided?.length, "expected len:", process.env.CRON_SECRET?.length);

      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 2) Toronto gününü hesapla
    const date = todayInToronto();

    // 3) Dış API'dan veriyi çek
    const startedAt = Date.now();
    const res = await fetchWithRetry(PRAYER_API_URL);
    if (!res.ok) {
      return NextResponse.json({ error: "upstream_failed", status: res.status }, { status: 502 });
    }

    const payload = await res.json();

    // 4) Minimal doğrulama
    if (!minimalValidatePayload(payload)) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 422 });
    }

    // 5) Supabase'e upsert
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase.from("prayer_cache").upsert(
      {
        date,
        payload,
        fetched_at: new Date().toISOString(),
        status: "ok",
      },
      { onConflict: "date" },
    );

    if (error) {
      console.error("DB insert failed:", error);
      return NextResponse.json({ error: "db_upsert_failed", detail: error.message }, { status: 500 });
    }

    const tookMs = Date.now() - startedAt;
    return NextResponse.json({ ok: true, date, tookMs });
  } catch (err: any) {
    // AbortError vs diğer hatalar aynı yerden döner
    return NextResponse.json({ error: "internal_error", detail: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
