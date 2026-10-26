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
      "Toronto'da namaz, sohbet ve kardeşlik. Namaz vakitleri Türkiye Diyanet İşleri Başkanlığı'ndan, cemaat vakitleri camimizden.",
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
  events: {
    eyebrow: "Etkinlikler",
    title: "Cemaatimizle buluşun",
    all: "Tüm etkinlikler",
    pageTitle: "Etkinlikler",
    pageIntro: "Camimizdeki dersler, sohbetler ve buluşmalar.",
    empty: "Şu anda planlanmış etkinlik yok. Yakında yeni etkinlikler eklenecek.",
    register: "Kayıt ol",
    registerFree: "Kayıt ol · ücretsiz",
    registerInApp: "Kayıt uygulamadan yapılır",
    free: "Ücretsiz",
    // Card eyebrow for recurring events (the app's *ProgrammeEyebrow).
    programme: { weekly: "Haftalık program", biweekly: "İki haftalık program", monthly: "Aylık program" } as Record<string, string>,
    // Category labels (youth_events.category; anything else → community), the eyebrow of one-off events.
    categories: {
      education: "Eğitim",
      youth: "Gençlik",
      family: "Aile",
      worship: "İbadet",
      community: "Topluluk",
    } as Record<string, string>,
    // The app's everyWeekday, indexed by weekday (0 = Sunday).
    everyWeekday: ["Her Pazar", "Her Pazartesi", "Her Salı", "Her Çarşamba", "Her Perşembe", "Her Cuma", "Her Cumartesi"],
    everyTwoWeeks: "İki haftada bir",
    monthly: "Her ay",
    afterPrayer: {
      fajr: "sabah namazından sonra",
      sunrise: "güneş doğduktan sonra",
      dhuhr: "öğle namazından sonra",
      asr: "ikindi namazından sonra",
      maghrib: "akşam namazından sonra",
      isha: "yatsı namazından sonra",
    } as Record<string, string>,
  },
  services: {
    eyebrow: "Hizmetler",
    title: "Zor günlerinizde yanınızdayız",
    intro: "Cenaze ve defin işlemlerinde görevlilerimiz her adımda size yardımcı olur.",
    details: "Detaylar",
    contactsTitle: "İrtibat",
    cemeteryTitle: "Mezarlığımız",
    directions: "Yol tarifi al",
    pageTitle: "Hizmetler",
  },
  donation: {
    eyebrow: "Bağış",
    title: "Caminize destek olun",
    intro: "Bağışlarınız camimizin hizmetlerini ayakta tutar. Ödeme Stripe ile güvenle alınır.",
    allFunds: "Bağış sayfasına git",
  },
  app: {
    eyebrow: "Mobil uygulama",
    title: "Pape Camii cebinizde",
    intro: "Her cemaatten önce hatırlatma, ana ekran widget'ları, etkinlik kaydı ve duyurular. Ücretsiz, reklamsız.",
    appStore: "App Store'dan indirin",
    features: [
      { title: "Hatırlatmalar", text: "Cemaatten 5 dk önce" },
      { title: "Widget'lar", text: "Ana ve kilit ekranı" },
      { title: "Etkinlik kaydı", text: "Uygulamadan kolayca" },
      { title: "3 dil", text: "Türkçe, English, Français" },
    ],
  },
  contact: {
    eyebrow: "İletişim",
    title: "Camimize bekleriz",
    address: "Adres",
    phone: "Telefon",
    email: "E-posta",
    hours: "Açık olduğu saatler",
    directions: "Yol tarifi al",
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
