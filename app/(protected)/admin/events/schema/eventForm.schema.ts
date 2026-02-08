import { z } from "zod";
import { DateTime } from "luxon";
import { Days } from "../types";

const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

const APP_ZONE = "America/Toronto";
const today = DateTime.now().setZone(APP_ZONE).startOf("day");
const oneYearLater = today.plus({ years: 1 });

export const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be at most 500 characters"),
    date: z.custom<DateTime>((val) => val instanceof DateTime).optional(),
    day: z.string().optional(),
    time: z.string().min(1, "Time is required"),
    phone: z.string().regex(phoneRegex, "Phone must be in format: (xxx) xxx-xxxx"),
    is_active: z.boolean(),
    is_featured: z.boolean(),
    is_recurring: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.is_recurring && !Object.values(Days).includes(data.day as string)) return false;

      return true;
    },
    {
      message: "Day is required when event is recurring",
      path: ["day"],
    },
  )
  .refine(
    (data) => {
      if (!data.is_recurring && data.date) {
        if (data.date >= oneYearLater || data.date <= today) return false;
      }
      return true;
    },
    {
      message: "Please select a date between today and one year from now.",
      path: ["date"],
    },
  );

export type EventFormValues = z.infer<typeof eventSchema>;
