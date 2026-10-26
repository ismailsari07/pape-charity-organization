import { publicClient } from "@/lib/server/public-client";

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
  const date = todayInToronto();

  // Same query as before; only the client changed (server-side anon client
  // instead of the old browser client module).
  const { data, error } = await publicClient()
    .from("prayer_cache")
    .select("payload, fetched_at, status")
    .eq("date", date)
    .single();

  if (error) throw error;
  return Response.json({ data });
}
