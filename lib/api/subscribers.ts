import { supabase } from "@/lib/supabase/client";
import type {
  Subscriber,
  CreateSubscriberInput,
  UpdateSubscriberInput,
  SubscriberStats,
} from "@/app/(protected)/admin/email/types/database.types";

async function timeoutPromise<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("İstek zaman aşımına uğradı (Supabase Takıldı)")), ms);
  });

  try {
    const result = await Promise.race([promise, timeout]);
    clearTimeout(timer!);
    return result;
  } catch (error) {
    clearTimeout(timer!);
    throw error;
  }
}

// ============================================
// GET ALL SUBSCRIBERS
// ============================================
export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const { data: subscriber, error } = await supabase.from("subscribers").select("*");

    if (error) {
      console.log("burda error", error);
      throw error;
    }
    return subscriber;
  } catch (error) {
    console.log("bu error", error);
    console.log("catch error", error);
    throw error;
  }
}

// ============================================
// GET SUBSCRIBER BY ID
// ============================================
export async function getSubscriberById(id: string): Promise<Subscriber | null> {
  try {
    const { data, error } = await supabase.from("subscribers").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting subscriber:", error);
    return null;
  }
}

// ============================================
// GET SUBSCRIBER BY EMAIL
// ============================================
export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  try {
    const { data, error } = await supabase.from("subscribers").select("*").eq("email", email).single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  } catch (error) {
    console.error("Error getting subscriber:", error);
    return null;
  }
}

// ============================================
// GET ACTIVE SUBSCRIBERS (for email sending)
// ============================================
export async function getActiveSubscribers(): Promise<Subscriber[]> {
  try {
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting active subscribers:", error);
    return [];
  }
}

// ============================================
// GET SUBSCRIBER STATS
// ============================================
export async function getSubscriberStats(): Promise<SubscriberStats> {
  try {
    const { data, error } = await supabase.from("subscribers").select("status");

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      active: data?.filter((s) => s.status === "active").length || 0,
      inactive: data?.filter((s) => s.status === "inactive").length || 0,
      unsubscribed: data?.filter((s) => s.status === "unsubscribed").length || 0,
    };

    return stats;
  } catch (error) {
    console.error("Error getting subscriber stats:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      unsubscribed: 0,
    };
  }
}

// ============================================
// CREATE SUBSCRIBER
// ============================================
export async function createSubscriber(data: CreateSubscriberInput): Promise<Subscriber | null> {
  try {
    // Check if email already exists
    const subscriber: Subscriber | null = await getSubscriberByEmail(data.email);

    // If exists and unsubscribed, reactivate
    if (subscriber && subscriber.status === "unsubscribed") {
      const { data: updated, error } = await supabase
        .from("subscribers")
        .update({
          status: "active",
          name: data.name,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriber.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    }

    // If exists and active/inactive, return error
    if (subscriber) {
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
      .single();

    if (error) throw error;
    return newSubscriber;
  } catch (error) {
    console.error("Error creating subscriber:", error);
    throw error;
  }
}

// ============================================
// UPDATE SUBSCRIBER
// ============================================
export async function updateSubscriber(id: string, data: UpdateSubscriberInput): Promise<Subscriber | null> {
  try {
    const { data: updated, error } = await supabase
      .from("subscribers")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } catch (error) {
    throw error;
  }
}

// ============================================
// DELETE SUBSCRIBER
// ============================================
export async function deleteSubscriber(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("subscribers").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    throw error;
  }
}

// ============================================
// UNSUBSCRIBE (Mark as unsubscribed)
// ============================================
export async function unsubscribeByEmail(email: string): Promise<boolean> {
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

// ============================================
// BULK UPDATE STATUS (for webhook handling)
// ============================================
export async function updateSubscriberStatus(
  email: string,
  status: "active" | "inactive" | "unsubscribed",
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("subscribers")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating subscriber status:", error);
    return false;
  }
}
