import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Server-only subscriber write for the public unsubscribe flow
// (/api/unsubscribe, linked from emails already sent). It runs for anonymous
// visitors, so it uses the service-role client: anon has no access to
// public.subscribers. The newsletter signup form was removed in the redesign.

// ============================================
// UNSUBSCRIBE (Mark as unsubscribed)
// ============================================
export async function unsubscribeByEmail(email: string): Promise<boolean> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from("subscribers")
      .update({
        status: "unsubscribed",
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unsubscribing:", error);
    throw error;
  }
}
