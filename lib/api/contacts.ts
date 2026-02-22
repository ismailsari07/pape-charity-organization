import { supabase } from "@/lib/supabase/client";
import { Contact, ContactFormData } from "@/app/(protected)/admin/contact/types";

export async function getContacts(): Promise<Contact[]> {
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return data as Contact[];
}

export async function getContactById(id: string): Promise<Contact> {
  const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single();

  if (error) throw error;
  return data as Contact;
}

export async function createContact(contact: ContactFormData): Promise<Contact> {
  const { data, error } = await supabase.from("contacts").insert([contact]).select().single();

  if (error) throw error;
  return data as Contact;
}

export async function updateContact(id: string, contact: Partial<ContactFormData>): Promise<Contact> {
  const { data, error } = await supabase.from("contacts").update(contact).eq("id", id).select().single();

  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) throw error;
}
