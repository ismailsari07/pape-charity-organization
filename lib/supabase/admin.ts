import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client — bypasses RLS. Server-side only.
//
// The "server-only" import makes the build fail if a Client Component ever
// imports this file, so the service-role key can't end up in the browser
// bundle. Use it only in route handlers / server code, and only for operations
// that must work for anonymous visitors (e.g. subscribe / unsubscribe).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase service-role client is not configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
