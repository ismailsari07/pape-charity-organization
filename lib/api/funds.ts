import { supabase } from "@/lib/supabase/client";
import { DonationFund } from "@/types/modules";

export async function getFunds() {
  const { data, error } = await supabase.from("funds").select("*").eq("is_active", true).order("created_at");

  if (error) throw error;

  return data;
}

export async function createFund(input: { code: string; label: string; color: string; ramadan_only: boolean }) {
  const { data, error } = await supabase.from("funds").insert(input);

  if (error) throw error;

  return data;
}

export async function toggleRamadan(code: string, value: boolean) {
  const { data, error } = await supabase.from("funds").update({ ramadan_only: value }).eq("code", code);

  if (error) throw error;

  return data;
}

export async function getDonationFunds(): Promise<DonationFund[]> {
  const { data, error } = await supabase
    .from("donation_funds")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
