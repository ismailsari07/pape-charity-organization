import { z } from "zod";

// Subscribe schema
export const subscribeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(25, "Name is too long"),
  email: z.string().email("Invalid email address").max(30, "Email is too long"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});

export type SubscribeFormValues = z.infer<typeof subscribeSchema>;

// Unsubscribe schema
export const unsubscribeSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type UnsubscribeFormValues = z.infer<typeof unsubscribeSchema>;
