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
    // Category labels (youth_events.category; anything else → community).
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
    intro: "Cenaze ve defin işlemlerinde ailelere her adımda destek oluyoruz.",
    details: "Ayrıntılar",
    contactsTitle: "İrtibat",
    cemeteryTitle: "Mezarlığımız",
    directions: "Yol tarifi al",
    pageTitle: "Hizmetler",
  },
  donation: {
    eyebrow: "Bağış",
    title: "Caminize destek olun",
    intro: "Bağışlarınız camimizin hizmetlerini ve cemaatimizin faaliyetlerini ayakta tutar.",
    allFunds: "Bağış sayfasına git",
  },
  app: {
    eyebrow: "Mobil uygulama",
    title: "Pape Camii cebinizde",
    intro: "Namaz vakitleri, duyurular ve etkinlikler her an yanınızda.",
    appStore: "App Store'dan indirin",
    features: [
      { title: "Vakitler ve hatırlatmalar", text: "Ezan ve cemaat vakitleri, istediğiniz vakit için bildirim." },
      { title: "Duyuru ve etkinlik bildirimleri", text: "Camiden haberler ve etkinlikler anında telefonunuzda." },
      { title: "Ana ekran widget'ı", text: "Sıradaki vakit, uygulamayı açmadan ana ekranınızda." },
      { title: "Kolay bağış", text: "Fonu seçin, bağışınızı birkaç dokunuşla yapın." },
    ],
  },
  contact: {
    eyebrow: "İletişim",
    title: "Bize ulaşın",
    address: "Adres",
    phone: "Telefon",
    email: "E-posta",
    hours: "Açık olduğumuz saatler",
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
