"use client";
import { Calendar1Icon, LocateIcon, PhoneCallIcon, PhoneIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { getActiveEvents } from "@/lib/api/events";
import { Event } from "@/app/(protected)/admin/events/types";
import { useQuery } from "@tanstack/react-query";

/**
 * 24 saatlik formatı (HH:mm:ss) 12 saatlik formata (h:mm a.m./p.m.) çevirir.
 * @param timeStr - Örn: "19:00:00"
 * @returns Örn: "7:00 p.m."
 */
function formatToTwelveHour(timeStr: string): string {
  // String'i parçalara ayırıp bir Date objesi oluşturuyoruz
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, seconds);

  // Tarayıcı/Node.js yerel ayarlarını kullanarak formatlıyoruz
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

export default function About() {
  const container = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const { data: events, isLoading } = useQuery({
    queryKey: ["featured-events"],
    queryFn: getActiveEvents,
  });

  if (isLoading) {
    return (
      <section className="flex flex-col gap-3 items-center text-center py-16 lg:py-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      id="about"
      className="container flex flex-col gap-24 py-8 lg:py-32"
    >
      <div className="flex flex-col gap-3">
        <motion.p className="text-4xl lg:text-6xl font-bold" variants={item}>
          Hizmetlerimiz
        </motion.p>
        <motion.p className="text-lg max-w-4xl" variants={item}>
          Derneğimizin yerine getirdiği vazifelerden biri de Toronto ve civarında vefat eden vatandaşlarımızın defin
          işleridir.
        </motion.p>
        <motion.p className="text-3xl font-bold mt-7" variants={item}>
          Defin Hizmetleri
        </motion.p>
        <motion.p className="text-lg max-w-4xl" variants={item}>
          Cenaze ve defin işlemlerinde, aşağıda belirtilen yöneticilerimiz toplumumuza her konuda destek sağlamaktadır.
          Tüm hizmetler, dini hassasiyetler gözetilerek ve yerine getirilmektedir.
        </motion.p>
        <motion.p className="text-lg max-w-4xl" variants={item}>
          Kanada Türk İslam Vakfı Mayıs 1993’de Pine Ridge Memorial Gardens’ın Ajax, Ontario mezarlığından 200 adet
          mezar yeri aldı. Eylül 2004’da alınan 120 mezar ile sayı 320 oldu. Mezarlığımızın etrafında diğer cemaatlerin
          aldıkları mezarlarla takriben 10,000 kişilik bir müslüman mezarlığı oluştu.Diğer dini gruplara da ayrılan
          kısımların bulunduğu bu büyük mezarlık içinde son yıllarda yollar asfaltlanmış, çevresi ağaçlarla
          donatılmıştır.
        </motion.p>
        <motion.p className="text-lg max-w-4xl" variants={item}>
          Cenaze ve defin işlemlerinde, aşağıda belirtilen yöneticilerimiz toplumumuza her konuda destek sağlamaktadır.
          Tüm hizmetler, dini hassasiyetler gözetilerek yerine getirilmektedir.
        </motion.p>

        <div className="flex flex-col gap-2 flex-wrap">
          <motion.div className="flex items-center gap-2 text-lg font-bold" variants={item}>
            <PhoneIcon size={16} className="text-green-400" />
            <span className="text-green-400">Fatih Sirinogullari:</span>
            <a href="tel:" className="underline">
              437 995 9470
            </a>
          </motion.div>
          <motion.div className="flex items-center gap-2 text-lg font-bold" variants={item}>
            <PhoneIcon size={16} className="text-green-400" />
            <span className="text-green-400">Ahmet Er:</span>
            <a href="tel:" className="underline">
              647 709 7219
            </a>
          </motion.div>
          <motion.div className="flex items-center gap-2 text-lg font-bold" variants={item}>
            <LocateIcon size={16} className="text-green-400" />
            Ajax Pine Ridge Memorial Gardens : 1757 Church St N Ajax, ON L1T 4T2
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <motion.p className="text-4xl md:text-6xl font-bold" variants={item}>
          Faaliyetler
        </motion.p>
        <motion.p className="text-lg max-w-4xl" variants={item}>
          Camimizde dini sohbetler, kültürel etkinlikler ve toplumsal buluşmalar düzenlenmektedir. Tüm faaliyetlerimizi
          yakından takip edebilir.
        </motion.p>

        <div className="flex flex-col md:flex-row flex-wrap gap-3 md:mt-8">
          {events.map((event: Event, i: number) => (
            <motion.div
              variants={item}
              key={i}
              className="md:w-[32%] flex flex-col items-start text-left gap-2 p-5 border border-gray-100 rounded-2xl"
            >
              <h4 className="text-3xl font-semibold">{event.title}</h4>
              <motion.p variants={item}>{event.description}</motion.p>
              <div className="w-full mt-auto">
                <div className="flex gap-1 items-center md:mt-4">
                  <Calendar1Icon size={"16"} />
                  {event.is_recurring
                    ? `${event.day} — ${formatToTwelveHour(event.time)}`
                    : `${event.date} — ${formatToTwelveHour(event.time)}`}
                </div>
                <div className="w-full flex gap-1 items-center">
                  <PhoneCallIcon size={"16"} /> {event.phone}
                  {event.is_recurring && (
                    <div className="px-2 rounded-2xl bg-blue-600 text-blue-100 text-sm ml-auto">haftalık</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
