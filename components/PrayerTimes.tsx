"use client";
import { getPrayerTimes } from "@/lib/api/prayer-times";
import { useQuery } from "@tanstack/react-query";
import { MoonIcon, SunIcon, SunriseIcon, SunsetIcon } from "lucide-react";

export default function PrayerTimes() {
  const { data, isLoading } = useQuery({
    queryKey: ["prayerToday"],
    queryFn: getPrayerTimes,
  });

  console.log("Prayer Times Data:", data);

  if (isLoading) return <div>Yükleniyor…</div>;

  return (
    <section id="prayer-times" className="flex flex-col gap-4 py-16 lg:py-32">
      <h2 className="text-4xl md:text-6xl text-left">Namaz Vakitleri</h2>

      <div className="md:w-[50%]">
        Namaz vakitleri, Diyanet İşleri Başkanlığı verilerine dayanarak sunulmaktadır. İbadetlerinizi en doğru zamanda
        yerine getirmeniz için güvenilir ve resmi kaynaklardan faydalanıyoruz.
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        {/* Additional Prayer Info */}
        <div className="md:w-[50%] text-3xl flex flex-col gap-4 justify-center items-center">
          {/* Current and Next Prayer Times */}
          <div className="flex gap-4 w-full">
            <div className="w-1/2 flex flex-col bg-[#fbf2ee] text-[#1b1522] rounded-2xl p-4">
              <div className="text-lg">Şu Anki Vakit</div>
              <div className="text-2xl font-semibold text-[#e87539]">{/*current?.trName*/}</div>
              <div className="text-4xl font-bold">{/*current?.time*/}</div>
              <div className="text-lg">
                Bitiş Saati -{" "}
                <span className="font-semibold">
                  {/*current?.name === "Fajr"
                    ? data.payload.dailyPrayerTimes[1].time
                    : next?.time*/}
                </span>
              </div>
            </div>

            <div className="w-1/2 flex flex-col bg-[#fbf2ee] text-[#1b1522] rounded-2xl p-4">
              <div className="text-lg">Sonraki Namaz</div>
              <div className="text-2xl font-semibold text-[#e87539]">{/*next?.trName*/}</div>
              <div className="text-4xl font-bold">{/*next?.time*/}</div>
              <div className="text-lg">
                Cemaat - <span className="font-semibold">{/*next?.iqamah*/}</span>
              </div>
            </div>
          </div>

          {/* Sunrise, midday, sunset times */}
          <div className="w-full flex justify-around items-center bg-[#fbf2ee] text-[#1b1522] rounded-2xl p-2 px-5">
            <div className="flex flex-col text-lg text-center">
              <div>Güneş Doğuşu</div>
              <div className="font-semibold">{data.payload.dailyPrayerTimes[1].time + " a.m"}</div>
            </div>
            <hr className="h-20 w-0.5 bg-gray-300" />
            <div className="flex flex-col text-lg text-center">
              <div>Öğle Vakti</div>
              <div className="font-semibold">{data.payload.dailyPrayerTimes[2].time + " p.m"}</div>
            </div>
            <hr className="h-20 w-0.5 bg-gray-300" />
            <div className="flex flex-col text-lg text-center">
              <div>Güneş Batışı</div>
              <div className="font-semibold">{data.payload.dailyPrayerTimes[4].time + " p.m"}</div>
            </div>
          </div>

          {/* Jumaah Time */}
          <div className="w-full bg-[#ffca9c] text-[#1b1522] rounded-2xl p-2 px-5 border-4 border-white text-center">
            <div>Cumaa</div>
            <span>Saati - </span>
            <span className="font-extrabold">{data.payload.jumaaPrayerTime} p.m</span>
          </div>
        </div>

        {/* Prayer Times */}
        <div className="w-full md:w-[50%] flex flex-col bg-[#fbf2ee] text-[#1b1522] gap-3 p-1 md:p-4 rounded-2xl">
          {/* Header */}
          <div className="flex justify-between items-center text-base md:text-2xl font-semibold  rounded-2xl p-2 px-10 border border-[#1d1d1f]">
            <div>Namaz</div>
            <div className="mr-10">Ezan</div>
            <div>İkame</div>
          </div>

          {/* Fajr */}
          <div className="flex justify-between items-center text-base md:text-2xl font-medium border-b border-b-gray-300 p-3">
            <div className="w-28 flex items-center gap-1 md:gap-4">
              <SunriseIcon className="text-[#e87539]" />
              <span>Sabah</span>
            </div>
            <div className="w-32">{data.payload.dailyPrayerTimes[0].time + " a.m"}</div>
            <div className="w-32">{data.payload.dailyPrayerTimes[0].iqamah} a.m</div>
          </div>

          {/* Dhuhr */}
          <div className="flex justify-between items-center text-base md:text-2xl font-medium border-b border-b-gray-300 p-3">
            <div className="w-28 flex items-center gap-1 md:gap-4">
              <SunIcon className="text-[#e87539]" />
              <span>Öğle</span>
            </div>
            <div className="w-32">{data.payload.dailyPrayerTimes[2].time + " p.m"}</div>
            <div className="w-32">{data.payload.dailyPrayerTimes[2].iqamah} p.m</div>
          </div>

          {/* Asr */}
          <div className="flex justify-between items-center text-base md:text-2xl font-medium border-b border-b-gray-300 p-3">
            <div className="w-28 flex items-center gap-1 md:gap-4">
              <SunIcon className="text-[#e87539]" />
              <span>İkindi</span>
            </div>
            <div className="w-32">{data.payload.dailyPrayerTimes[3].time + " p.m"}</div>
            <div className="w-32">{data.payload.dailyPrayerTimes[3].iqamah} p.m</div>
          </div>

          {/* Maghrib */}
          <div className="flex justify-between items-center text-base md:text-2xl font-medium border-b border-b-gray-300 p-3">
            <div className="w-28 flex items-center gap-1 md:gap-4">
              <SunsetIcon className="text-[#e87539]" />
              <span>Akşam</span>
            </div>
            <div className="w-32">{data.payload.dailyPrayerTimes[4].time + " p.m"}</div>
            <div className="w-32">{data.payload.dailyPrayerTimes[4].iqamah} p.m</div>
          </div>

          {/* Isha */}
          <div className="flex justify-between items-center text-base md:text-2xl font-medium p-3">
            <div className="w-28 flex items-center gap-1 md:gap-4">
              <MoonIcon className="text-[#e87539]" />
              <span>Yatsı</span>
            </div>
            <div className="w-32">{data.payload.dailyPrayerTimes[5].time + " p.m"}</div>
            <div className="w-32">{data.payload.dailyPrayerTimes[5].iqamah} p.m</div>
          </div>
        </div>
      </div>
    </section>
  );
}
