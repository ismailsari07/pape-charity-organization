import "server-only";
import { publicClient } from "@/lib/server/public-client";
import { parseFunds, type DonationFund } from "@/lib/funds/parse";

export type { DonationFund };

/** Active funds in display_order, for the donation page and the home band. Throws on errors. */
export async function getDonationFunds(): Promise<DonationFund[]> {
  const { data, error } = await publicClient()
    .from("donation_funds")
    .select("slug, title, description, title_i18n, description_i18n, display_order, is_active")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw error;
  return parseFunds(data ?? []);
}
