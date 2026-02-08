import { EventPayload, EventRow } from "@/app/(protected)/admin/events/types";
import { supabase } from "@/lib/supabase/client";

// Get The Event
export async function getEvent(id: string): Promise<EventPayload> {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

// Get All Events
export async function getAllEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase.from("events").select("*").order("display_order", { ascending: true });

  if (error) throw error;
  return data;
}

// Insert Event
export async function createEvent(event: EventPayload) {
  const { data, error } = await supabase.from("events").insert(event).select().single();

  if (error) throw error;
  return data;
}

// Update Event
export async function updateEvent(id: string, event: EventPayload) {
  const { data, error } = await supabase.from("events").update(event).eq("id", id).select().single();

  if (error) throw error;
  return data;
}

// Etkinlik sil
export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw error;
}

// Ana sayfada gösterilecek etkinlikler (featured)
export async function getFeaturedEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(3);

  if (error) throw error;
  return data;
}

// Service sayfasinda gösterilecek etkinlikler (all)
export async function getActiveEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(3);

  if (error) throw error;
  return data;
}
