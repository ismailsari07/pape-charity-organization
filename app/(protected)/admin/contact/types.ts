export type Contact = {
  id: string;
  full_name: string;
  position: string;
  phone: string | null;
  email: string;
  created_at: string;
  updated_at: string;
};

export type ContactFormData = {
  full_name: string;
  position: string;
  phone: string | null;
  email: string;
};

export type ContactInsert = Omit<Contact, "id" | "created_at" | "updated_at">;
