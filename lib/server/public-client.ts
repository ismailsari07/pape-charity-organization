import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cookie-less anon client for the public pages' server-side reads. No
// cookies on purpose: pages stay cacheable with ISR (revalidate), which a
// cookie-reading client would turn into dynamic rendering. RLS decides what
// anon may read.
export function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
