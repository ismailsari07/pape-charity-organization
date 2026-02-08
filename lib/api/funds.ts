import { supabase } from "@/lib/supabase/client";
import { DonationFund } from "@/types/modules";

export async function getAllDonationFunds(): Promise<DonationFund[]> {
  const { data, error } = await supabase.from("donation_funds").select("*").order("display_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateDonationFund(id: string, isActive: boolean) {
  const { data, error } = await supabase.from("donation_funds").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;

  return data;
}

// Bulk update donation funds
export async function bulkUpdateDonationFunds(updates: Array<{ id: string; is_active: boolean }>) {
  const promises = updates.map(({ id, is_active }) =>
    supabase.from("donation_funds").update({ is_active }).eq("id", id),
  );

  const results = await Promise.all(promises);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    throw errors[0].error;
  }

  return true;
}

// Get active donation funds (public)
export async function getDonationFunds() {
  const { data, error } = await supabase
    .from("donation_funds")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data as DonationFund[];
}
