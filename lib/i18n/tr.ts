// Every UI string of the public site, in Turkish. English and French get a
// file of the same shape (Dictionary) later; components never hold text.
// Texts that come from the database ({tr,en,fr}) are resolved with
// resolveI18n instead (lib/i18n/index.ts).

export const tr = {
  site: {
    name: "Pape Camii",
    legalName: "Kanada Türk İslam Vakfı",
  },
  nav: {
    prayerTimes: "Namaz Vakitleri",
    announcements: "Duyurular",
    events: "Etkinlikler",
    services: "Hizmetler",
    contact: "İletişim",
    donate: "Bağış yap",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    home: "Ana sayfa",
  },
  hero: {
    eyebrow: "336 Pape Avenue · Toronto",
    title: "Pape Camii'ne hoş geldiniz",
    intro:
      "Namaz vakitleri Türkiye Diyanet İşleri Başkanlığı'ndan, cemaat vakitleri camimizden; her gün güncel.",
  },
  prayer: {
    todayTitle: "Bugünün vakitleri",
    columnPrayer: "Vakit",
    columnAthan: "Ezan",
    columnIqamah: "Cemaat",
    now: "Şimdi",
    jumuah: "Cuma namazı",
    notLoaded: "Bugünün vakitleri henüz yüklenmedi. Lütfen biraz sonra tekrar bakın.",
    footnote: "Vakitler: Türkiye Diyanet İşleri Başkanlığı · Cemaat vakitleri: Pape Camii",
    names: {
      Fajr: "İmsak",
      Sunrise: "Güneş",
      Dhuhr: "Öğle",
      Asr: "İkindi",
      Maghrib: "Akşam",
      Isha: "Yatsı",
    } as Record<string, string>,
    // Same Turkish month names as the app (app_tr.arb hijriMonth1–12).
    hijriMonths: [
      "Muharrem",
      "Safer",
      "Rebiülevvel",
      "Rebiülahir",
      "Cemaziyelevvel",
      "Cemaziyelahir",
      "Recep",
      "Şaban",
      "Ramazan",
      "Şevval",
      "Zilkade",
      "Zilhicce",
    ],
  },
  announcement: {
    eyebrow: "Duyuru",
    readMore: "Devamını oku",
    all: (count: number) => `Tüm duyurular (${count})`,
  },
  footer: {
    copyright: "© 2026 Kanada Türk İslam Vakfı · Pape Camii",
    announcements: "Duyurular",
    donate: "Bağış",
    privacy: "Gizlilik",
    instagram: "Instagram",
  },
};

export type Dictionary = typeof tr;
