import type { SupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ *
 * Override'lar: insan tarafından Supabase panelinden girilen düzeltmeler.
 * Cron çalıştığında pape-api verisinin ÜZERİNE bindirilir; prayer_cache'in
 * yapısı asla değişmez — sadece değerler değişir.
 *
 * Tablo şeması ve panel kullanımı: docs/overrides.sql, docs/overrides-guide.md
 * ------------------------------------------------------------------ */

export type OverrideRow = {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export async function fetchOverridesForDate(
  supabase: SupabaseClient,
  date: string,
): Promise<OverrideRow[]> {
  const { data, error } = await supabase
    .from("overrides")
    .select("id, type, start_date, end_date, payload, created_at")
    .lte("start_date", date)
    .gte("end_date", date)
    // Artan created_at: sonraki satır öncekinin üzerine yazar,
    // yani çakışmada "en son oluşturulan kazanır" kuralı doğal olarak işler.
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as OverrideRow[];
}

// type="iqamah" -> {"isha": "10:30"} gibi kısmi bir harita.
// Sadece payload'da adı geçen namazın iqamah'ı değişir; ezan (time) ve
// diğer namazlar Diyanet'ten geldiği gibi kalır.
function applyIqamahOverride(target: any, body: Record<string, unknown>, id: number) {
  const list = target?.dailyPrayerTimes;
  if (!Array.isArray(list)) {
    console.warn("[prayer/refresh] iqamah override atlandı: dailyPrayerTimes yok", { id });
    return;
  }

  for (const [rawName, rawTime] of Object.entries(body)) {
    if (typeof rawTime !== "string" || !rawTime.trim()) {
      console.warn("[prayer/refresh] iqamah override atlandı: geçersiz saat", { id, prayer: rawName });
      continue;
    }

    const entry = list.find(
      (p: any) => typeof p?.name === "string" && p.name.toLowerCase() === rawName.trim().toLowerCase(),
    );

    if (!entry) {
      console.warn("[prayer/refresh] iqamah override atlandı: bilinmeyen namaz", { id, prayer: rawName });
      continue;
    }

    // Yapıyı koru: Sunrise'ın iqamah alanı yoktur, sonradan eklemeyiz.
    if (!("iqamah" in entry)) {
      console.warn("[prayer/refresh] iqamah override atlandı: bu namazda iqamah alanı yok", {
        id,
        prayer: rawName,
      });
      continue;
    }

    entry.iqamah = rawTime.trim();
  }
}

// type="notice" -> {"text": "..."} o günün notices dizisini tamamen değiştirir.
// notices düz string dizisidir: ["..."]
function applyNoticeOverride(target: any, body: Record<string, unknown>, id: number) {
  const text = body.text;
  if (typeof text !== "string" || !text.trim()) {
    console.warn("[prayer/refresh] notice override atlandı: payload.text yok", { id });
    return;
  }
  target.notices = [text.trim()];
}

export function applyOverrides(payload: any, overrides: OverrideRow[]): any {
  // Override yoksa nesneye hiç dokunma — aynı referans döner,
  // böylece yazılan veri bit bit eskisiyle aynı kalır.
  if (!overrides.length) return payload;

  const merged = structuredClone(payload);

  for (const ov of overrides) {
    const body = ov.payload;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      console.warn("[prayer/refresh] override atlandı: boş/geçersiz payload", { id: ov.id, type: ov.type });
      continue;
    }

    switch (ov.type) {
      case "iqamah":
        applyIqamahOverride(merged, body, ov.id);
        break;
      case "notice":
        applyNoticeOverride(merged, body, ov.id);
        break;
      default:
        // İleride eklenecek türler (hadith, eid…) burada sessizce yok sayılır.
        console.warn("[prayer/refresh] override atlandı: bilinmeyen type", { id: ov.id, type: ov.type });
    }
  }

  return merged;
}
