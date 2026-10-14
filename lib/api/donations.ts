import { DailyDonation, DonationWithFund } from "@/app/(protected)/admin/donations/types";
import { supabase } from "@/lib/supabase/client";

// Tüm bağışları çek (Admin için)
export async function getAllDonations(): Promise<DonationWithFund[]> {
  const { data, error } = await supabase
    .from("donations")
    .select(
      `
						*,
						donation_funds (slug, title, color)
						`,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Tek bağış çek
export async function getDonation(id: string) {
  const { data, error } = await supabase.from("donations").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

export async function getDailyDonations(): Promise<DailyDonation[]> {
  const { data, error } = await supabase.from("daily_donation_totals").select("*");

  if (error) throw error;
  return data;
}

// İstatistikler
export async function getDonationStats() {
  const { data, error } = await supabase.from("donations").select("amount_cents, refunded_amount_cents, fund_code");

  if (error) throw error;

  // İadeler düşülmüş tutar
  type Row = { amount_cents: number; refunded_amount_cents: number | null; fund_code: string };
  const net = (d: Row) => d.amount_cents - (d.refunded_amount_cents ?? 0);

  // Toplam
  const total = data.reduce((sum: number, d: Row) => sum + net(d), 0);

  // Fon bazında
  const byFund = data.reduce((acc: any, d: Row) => {
    if (!acc[d.fund_code]) acc[d.fund_code] = 0;
    acc[d.fund_code] += net(d);
    return acc;
  }, {});

  return {
    total,
    byFund,
    count: data.length,
  };
}
