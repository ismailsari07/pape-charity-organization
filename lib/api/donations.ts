import { DailyDonation, DonationWithFund } from "@/app/(protected)/admin/donations/types";
import { supabase } from "@/lib/supabase/client";

// Tüm bağışları çek (Admin için)
export async function getAllDonations(): Promise<DonationWithFund[]> {
  const { data, error } = await supabase
    .from("donations")
    .select(
      `
						*,
						funds (code, label,color)
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
  const { data, error } = await supabase.from("donations").select("amount_cents, fund_code");

  if (error) throw error;

  // Toplam
  const total = data.reduce((sum: number, d: { amount_cents: number }) => sum + d.amount_cents, 0);

  // Fon bazında
  const byFund = data.reduce((acc: any, d: { fund_code: string; amount_cents: number }) => {
    if (!acc[d.fund_code]) acc[d.fund_code] = 0;
    acc[d.fund_code] += d.amount_cents;
    return acc;
  }, {});

  return {
    total,
    byFund,
    count: data.length,
  };
}
