// lib/api/announcements.ts

import { supabase } from "@/lib/supabase/client";
import { Announcement, AnnouncementFormData, AnnouncementUpdate } from "@/types/announcement";
import { deleteImage } from "@/lib/utils";

/**
 * Get all announcements (Admin)
 */
export const getAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("priority", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data as Announcement[];
};

/**
 * Get published announcements for hero banner (Max 1)
 */
export const getHeroBanner = async (): Promise<Announcement | null> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("status", "published")
    .eq("display_type", "hero")
    .gt("expires_at", now)
    .order("priority", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
};

/**
 * Get published announcements for widget (Max 3)
 */
export const getWidgetAnnouncements = async (): Promise<Announcement[]> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("status", "published")
    .eq("display_type", "widget")
    .gt("expires_at", now)
    .order("priority", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) throw error;
  return data as Announcement[];
};

/**
 * Get single announcement by ID
 */
export const getAnnouncementById = async (id: string): Promise<Announcement> => {
  const { data, error } = await supabase.from("announcements").select("*").eq("id", id).single();

  if (error) throw error;
  return data as Announcement;
};

/**
 * Create new announcement
 */
export const createAnnouncement = async (data: AnnouncementFormData): Promise<Announcement> => {
  const insertData = {
    title: data.title,
    description: data.description,
    image_url: data.image_url || null,
    image_alt_text: data.image_alt_text || null,
    button_text: data.button_text || null,
    button_url: data.button_url || null,
    display_type: data.display_type,
    priority: data.priority,
    status: data.status || "draft",
    expires_at: typeof data.expires_at === "string" ? data.expires_at : data.expires_at.toISOString(),
    published_at: data.status === "published" ? new Date().toISOString() : null,
  };

  const { data: result, error } = await supabase.from("announcements").insert([insertData]).select().single();

  if (error) throw error;
  return result as Announcement;
};

/**
 * Update announcement
 */
export const updateAnnouncement = async (id: string, data: AnnouncementUpdate): Promise<Announcement> => {
  const updateData: Record<string, any> = {};

  // Build update object with only provided fields
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image_url !== undefined) updateData.image_url = data.image_url;
  if (data.image_alt_text !== undefined) updateData.image_alt_text = data.image_alt_text;
  if (data.button_text !== undefined) updateData.button_text = data.button_text;
  if (data.button_url !== undefined) updateData.button_url = data.button_url;
  if (data.display_type !== undefined) updateData.display_type = data.display_type;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.expires_at !== undefined) {
    updateData.expires_at = typeof data.expires_at === "string" ? data.expires_at : data.expires_at.toISOString();
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
    // Set published_at when publishing
    if (data.status === "published") {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data: result, error } = await supabase
    .from("announcements")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return result as Announcement;
};

/**
 * Delete announcement (and its image)
 */
export const deleteAnnouncement = async (id: string): Promise<void> => {
  // 1. Get announcement to find image
  const { data: announcement, error: fetchError } = await supabase
    .from("announcements")
    .select("image_url")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // 2. Delete image from storage
  if (announcement?.image_url) {
    await deleteImage(announcement.image_url);
  }

  // 3. Delete announcement
  const { error: deleteError } = await supabase.from("announcements").delete().eq("id", id);

  if (deleteError) throw deleteError;
};

/**
 * Publish announcement
 */
export const publishAnnouncement = async (id: string): Promise<Announcement> => {
  return updateAnnouncement(id, {
    status: "published",
  });
};

/**
 * Archive announcement (and delete its image)
 */
export const archiveAnnouncement = async (id: string): Promise<Announcement> => {
  // Get announcement to find image
  const { data: announcement } = await supabase.from("announcements").select("image_url").eq("id", id).single();

  // Delete image
  if (announcement?.image_url) {
    await deleteImage(announcement.image_url);
  }

  // Archive
  return updateAnnouncement(id, {
    status: "archived",
  });
};

/**
 * Check for expired announcements and archive them
 * Usually called by a cron job
 */
export const checkAndArchiveExpired = async (): Promise<number> => {
  const now = new Date().toISOString();

  // Find expired announcements
  const { data: expired, error: fetchError } = await supabase
    .from("announcements")
    .select("id, image_url")
    .eq("status", "published")
    .lt("expires_at", now);

  if (fetchError) throw fetchError;

  if (!expired || expired.length === 0) {
    return 0;
  }

  // Delete their images
  for (const announcement of expired) {
    if (announcement.image_url) {
      await deleteImage(announcement.image_url);
    }
  }

  // REFACTOR: any
  // Archive them
  const ids = expired.map((a: any) => a.id);
  const { error: updateError } = await supabase.from("announcements").update({ status: "archived" }).in("id", ids);

  if (updateError) throw updateError;

  return expired.length;
};

/**
 * Cleanup old archived announcements (> 90 days)
 * Called by cron job to free up storage
 */
export const cleanupOldAnnouncements = async (): Promise<number> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Find old archived announcements
  const { data: oldAnnouncements, error: fetchError } = await supabase
    .from("announcements")
    .select("id, image_url")
    .eq("status", "archived")
    .lt("updated_at", ninetyDaysAgo.toISOString());

  if (fetchError) throw fetchError;

  if (!oldAnnouncements || oldAnnouncements.length === 0) {
    return 0;
  }

  // Delete their images
  for (const announcement of oldAnnouncements) {
    if (announcement.image_url) {
      await deleteImage(announcement.image_url);
    }
  }

  // REFACTOR: any
  // Delete them
  const ids = oldAnnouncements.map((a: any) => a.id);
  const { error: deleteError } = await supabase.from("announcements").delete().in("id", ids);

  if (deleteError) throw deleteError;

  return oldAnnouncements.length;
};
