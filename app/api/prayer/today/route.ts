import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

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

export const runtime = "nodejs";

export async function GET() {
  try {
    const date = todayInToronto();

    const { data, error } = await supabase
      .from("prayer_cache")
      .select("payload, fetched_at, status")
      .eq("date", date)
      .single();

    if (error) {
      return NextResponse.json({ error: "not_found", detail: error.message }, { status: 404 });
    }
    if (!data?.payload) {
      return NextResponse.json({ error: "empty_payload" }, { status: 502 });
    }

    return NextResponse.json({
      date,
      lastUpdated: data.fetched_at,
      status: data.status,
      source: "cache",
      payload: data.payload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "internal_error", detail: String(err?.message ?? err) }, { status: 500 });
  }
}
