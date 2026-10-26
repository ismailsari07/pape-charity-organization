"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DATE_LOCALE, t } from "@/lib/i18n";
import { torontoDate } from "@/lib/prayer/range";
import { prayerClock12, type PrayerDay } from "@/lib/prayer/display";
import { weekdayOf } from "@/lib/events/schedule";

/** "6:09" — the column already says which prayer it is; the 12-hour rule decides the hour. */
const clock = (name: string, stored: string) => prayerClock12(name, stored).replace(/ (AM|PM)$/, "");

function dateParts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const at = new Date(Date.UTC(y, m - 1, d, 12));
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(DATE_LOCALE, { timeZone: "UTC", ...o }).format(at);
  return { day: fmt({ day: "numeric", month: "short" }), weekday: fmt({ weekday: "long" }), weekdayShort: fmt({ weekday: "short" }) };
}

/**
 * The coming days from prayer_cache. Today's row is highlighted on the
 * Toronto clock in the browser (a cached page stays right after midnight:
 * past days are dropped). Fridays show Jumu'ah in the Öğle column.
 */
export default function MonthTable({ serverToday, days }: { serverToday: string; days: PrayerDay[] }) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setToday(torontoDate());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  const from = today ?? serverToday;
  const rows = days.filter((d) => d.date >= from);

  if (rows.length === 0) return <p className="text-pm-text-2">{t.prayerPage.empty}</p>;

  const names = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  return (
    <div className="overflow-x-auto rounded-[24px] border border-pm-line bg-pm-card">
      <table className="w-full border-collapse text-left text-[13px] tabular-nums sm:min-w-[720px] sm:text-base">
        <thead>
          <tr className="text-[10px] font-bold tracking-[0.5px] text-pm-table-head uppercase sm:text-xs sm:tracking-[1px]">
            <th scope="col" className="sticky left-0 bg-pm-card py-3 pr-1 pl-3 sm:px-5 sm:py-4">
              {t.prayerPage.date}
            </th>
            {names.map((n) => (
              <th key={n} scope="col" className="px-1 py-3 text-right last:pr-3 sm:px-3 sm:py-4 sm:last:pr-5">
                {t.prayer.names[n]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => {
            const isToday = d.date === today;
            const isFriday = weekdayOf(d.date) === 5;
            const { day, weekday, weekdayShort } = dateParts(d.date);
            return (
              <tr key={d.date} aria-current={isToday ? "date" : undefined} className={cn("border-t border-white/[0.06]", isToday && "bg-pm-green text-white")}>
                <th scope="row" className={cn("sticky left-0 py-2.5 pr-1 pl-3 text-left font-normal sm:px-5 sm:py-3", isToday ? "bg-pm-green" : "bg-pm-card")}>
                  <span className="flex items-center gap-2 font-bold">
                    {day}
                    {isToday && <span className="hidden rounded-full bg-white/[0.18] px-2 py-0.5 text-[10px] font-extrabold tracking-[0.5px] uppercase sm:inline">{t.prayerPage.today}</span>}
                  </span>
                  <span className={cn("block text-[11px] sm:text-[13px]", isToday ? "text-white/80" : isFriday ? "text-pm-gold" : "text-pm-muted")}>
                    <span className="sm:hidden">{weekdayShort}</span>
                    <span className="hidden sm:inline">{weekday}</span>
                  </span>
                </th>
                {d.prayers.map((p) => {
                  const jumuah = isFriday && p.name === "Dhuhr" && d.jumuah;
                  return (
                    <td key={p.name} className="px-1 py-2.5 text-right last:pr-3 sm:px-3 sm:py-3 sm:last:pr-5">
                      {jumuah ? (
                        <>
                          <span className={cn("block font-bold", isToday ? "text-white" : "text-pm-gold-soft")}>{clock("Dhuhr", d.jumuah!)}</span>
                          <span className={cn("block text-[11px] sm:text-[12px] font-semibold", isToday ? "text-white/80" : "text-pm-gold")}>{t.prayerPage.friday}</span>
                        </>
                      ) : (
                        <>
                          <span className={cn("block font-semibold", isToday ? "text-white" : "text-pm-text")}>{clock(p.name, p.time)}</span>
                          <span className={cn("block text-[11px] sm:text-[12px]", isToday ? "text-white/75" : "text-pm-muted")}>{p.iqamah ? clock(p.name, p.iqamah) : "—"}</span>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
