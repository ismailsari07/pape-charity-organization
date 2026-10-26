import "server-only";
import { publicClient } from "@/lib/server/public-client";

export type DonationFund = { slug: string; title: string; description?: string };

// The website's holding fund for unmatched payments; never offered.
const HOLDING_FUND = "unassigned";
const SLUG = /^[a-z0-9_-]{1,64}$/;

/**
 * Active funds in display_order, read like the app (youth-toronto
 * donation_funds.dart): a row without a usable slug or title is skipped, and
 * is_active is checked here rather than trusted to RLS. The donation page
 * also shows each fund's description (a website-only column). Throws on errors.
 */
export async function getDonationFunds(): Promise<DonationFund[]> {
  const { data, error } = await publicClient()
    .from("donation_funds")
    .select("slug, title, description, display_order, is_active")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw error;
  return (data ?? []).flatMap((row) => {
    const slug = typeof row.slug === "string" ? row.slug : "";
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (row.is_active !== true || !SLUG.test(slug) || slug === HOLDING_FUND || !title) return [];
    const description = typeof row.description === "string" && row.description.trim() ? row.description.trim() : undefined;
    return [{ slug, title, description }];
  });
}
