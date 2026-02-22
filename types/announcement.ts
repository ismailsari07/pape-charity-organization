export type Announcement = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  image_alt_text: string | null;
  button_text: string | null;
  button_url: string | null;
  status: "draft" | "published" | "archived";
  display_type: "hero" | "widget";
  priority: number; // 1-10
  expires_at: string; // ISO date
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AnnouncementFormData = {
  title: string;
  description: string;
  image_url?: string | null;
  image_alt_text?: string;
  button_text?: string | null;
  button_url?: string | null;
  display_type: "hero" | "widget";
  priority: number;
  expires_at: Date | string;
  status?: "draft" | "published" | "archived";
};

export type AnnouncementInsert = Omit<Announcement, "id" | "created_at" | "updated_at">;

export type AnnouncementUpdate = Partial<AnnouncementFormData>;
