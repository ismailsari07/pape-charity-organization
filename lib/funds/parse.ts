// donation_funds rows → what the site shows. Pure, unit-tested in parse.test.ts.

import { resolveI18n } from "../i18n/index.ts";
import type { Lang } from "../i18n/config.ts";

export type DonationFund = { slug: string; title: string; description?: string };

// The website's holding fund for unmatched payments; never offered.
const HOLDING_FUND = "unassigned";
const SLUG = /^[a-z0-9_-]{1,64}$/;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Read like the app (youth-toronto donation_funds.dart): a row without a usable
 * slug or title is skipped, and is_active is checked here rather than trusted
 * to RLS. Texts come from title_i18n / description_i18n in the page's language;
 * the plain columns (copies of Turkish) are the fallback. The donation page also
 * shows each fund's description, which the app doesn't.
 */
export function parseFunds(rows: readonly Record<string, unknown>[], lang: Lang): DonationFund[] {
  return rows.flatMap((row) => {
    const slug = typeof row.slug === "string" ? row.slug : "";
    const title = resolveI18n(row.title_i18n, lang).trim() || text(row.title);
    if (row.is_active !== true || !SLUG.test(slug) || slug === HOLDING_FUND || !title) return [];
    const description = resolveI18n(row.description_i18n, lang).trim() || text(row.description) || undefined;
    return [{ slug, title, description }];
  });
}
