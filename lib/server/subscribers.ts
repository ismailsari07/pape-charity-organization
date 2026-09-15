import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Subscriber, CreateSubscriberInput } from "@/app/(protected)/admin/email/types/database.types";

// Server-only subscriber writes for the PUBLIC flows (/api/subscribe,
// /api/unsubscribe). These run for anonymous visitors, so they use the
// service-role client: once RLS is enabled on public.subscribers, the anon
// client can no longer read or write that table.
//
// The admin panel keeps using lib/api/subscribers.ts (browser client, signed-in
// admin session) — that module must never get the service role.

// ============================================
// CREATE SUBSCRIBER (or reactivate an unsubscribed one)
// ============================================
export async function createSubscriber(data: CreateSubscriberInput): Promise<Subscriber | null> {
  const supabase = createAdminClient();

  try {
    // Check if email already exists
    const { data: existing, error: lookupError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("email", data.email)
      .maybeSingle<Subscriber>();

    if (lookupError) throw lookupError;

    // If exists and unsubscribed, reactivate
    if (existing && existing.status === "unsubscribed") {
      const { data: updated, error } = await supabase
        .from("subscribers")
        .update({
          status: "active",
          name: data.name,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single<Subscriber>();

      if (error) throw error;
      return updated;
    }

    // If exists and active/inactive, return error
    if (existing) {
      throw new Error("This email is already subscribed");
    }

    // Create new subscriber
    const { data: newSubscriber, error } = await supabase
      .from("subscribers")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        status: "active",
      })
      .select()
      .single<Subscriber>();

    if (error) throw error;
    return newSubscriber;
  } catch (error) {
    console.error("Error creating subscriber:", error);
    throw error;
  }
}

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
