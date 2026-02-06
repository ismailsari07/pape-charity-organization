// app/(protected)/admin/email/schema/email.schema.ts

import { z } from "zod";

export const emailSendSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  to: z.union([
    z.string().email("Invalid email address"),
    z.array(z.string().email("Invalid email address")).min(1, "At least one recipient is required"),
  ]),
});

export type EmailSendFormValues = z.infer<typeof emailSendSchema>;

// Bulk email send için
export const bulkEmailSendSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  subscriber_ids: z.array(z.string().uuid()).min(1, "At least one subscriber must be selected"),
  send_to_all: z.boolean().default(false),
});

export type BulkEmailSendFormValues = z.infer<typeof bulkEmailSendSchema>;
