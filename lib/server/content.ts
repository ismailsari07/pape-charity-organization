import "server-only";
import { cache } from "react";
import { parseBundle, DEFAULT_CONTENT, type SiteContent } from "@/lib/content/bundle";
import { publicClient } from "@/lib/server/public-client";

// Mosque info, links, feature flags, services and contacts: the same single
// call the app makes, rpc('app_content_bundle') (caller's rights: visible rows
// only). Never throws: on any error the site shows the bundled defaults, like
// the app on its first offline launch. Deduplicated per request (layout +
// page both ask).
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    const { data, error } = await publicClient().rpc("app_content_bundle");
    if (error) throw error;
    return parseBundle(data);
  } catch (error) {
    console.error("[content] app_content_bundle failed; using defaults", error);
    return DEFAULT_CONTENT;
  }
});
