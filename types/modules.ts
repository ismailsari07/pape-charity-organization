export type PrayerItem = {
  name: "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
  time: string;
  iqamah?: string;
  ampm: "a.m" | "p.m";
};

export interface CreateSubscriberInput {
  name: string;
  email: string;
  phone?: string;
}
