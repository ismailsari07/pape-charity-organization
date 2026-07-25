// lib/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

// ✅ Function export yerine direct export
export function createClient() {
  if (!supabaseInstance) {
    if (process.env.NODE_ENV !== "production") console.log("🔧 Creating new Supabase client");
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// ✅ Reset function
function resetClient() {
  if (process.env.NODE_ENV !== "production") console.log("🔄 Resetting Supabase client");
  supabaseInstance = null;
}

// ✅ Visibility change handler
if (typeof window !== "undefined") {
  let wasHidden = false;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      wasHidden = true;
      if (process.env.NODE_ENV !== "production") console.log("👁️ Tab hidden");
    } else if (wasHidden) {
      wasHidden = false;
      if (process.env.NODE_ENV !== "production") console.log("👁️ Tab visible - will reset Supabase on next use");
      resetClient();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
}

// ✅ Backward compatibility - mevcut kodların çalışması için
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(target, prop) {
    const client = createClient();
    return client[prop as keyof typeof client];
  },
});
