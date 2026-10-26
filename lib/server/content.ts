import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { parseBundle, DEFAULT_CONTENT, type SiteContent } from "@/lib/content/bundle";
import { publicClient } from "@/lib/server/public-client";

// The raw bundle, kept in Next's data cache for 60 s: pages that render on
// every request (/community reads ?tab) still call the database at most
// once a minute. Errors are not cached.
const fetchBundle = unstable_cache(
  async () => {
    const { data, error } = await publicClient().rpc("app_content_bundle");
    if (error) throw error;
    return data as unknown;
  },
  ["app_content_bundle"],
  { revalidate: 60 },
);

// Mosque info, links, feature flags, services and contacts: the same single
// call the app makes, rpc('app_content_bundle') (caller's rights: visible rows
// only). Never throws: on any error the site shows the bundled defaults, like
// the app on its first offline launch. Deduplicated per request (layout +
// page both ask).
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    return parseBundle(await fetchBundle());
  } catch (error) {
    console.error("[content] app_content_bundle failed; using defaults", error);
    return DEFAULT_CONTENT;
  }
});
