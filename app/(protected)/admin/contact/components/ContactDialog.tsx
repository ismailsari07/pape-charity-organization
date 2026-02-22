"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Contact, ContactFormData } from "../types";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { IMaskInput } from "react-imask";
const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

const contactFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(50, "Full name must be at most 100 characters"),
  position: z.string().min(1, "Position is required").max(50, "Position must be at most 100 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Phone must be in format: (xxx) xxx-xxxx").or(z.literal("")),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSave: (data: ContactFormData) => Promise<void>;
  isLoading: boolean;
}

export default function ContactDialog({ open, onOpenChange, contact, onSave, isLoading }: ContactDialogProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      full_name: "",
      position: "",
      email: "",
      phone: "",
    },
  });

  // Reset form when contact changes
  useEffect(() => {
    if (contact) {
      form.reset({
        full_name: contact.full_name,
        position: contact.position,
        email: contact.email,
        phone: contact.phone || "",
      });
    } else {
      form.reset({
        full_name: "",
        position: "",
        email: "",
        phone: "",
      });
    }
  }, [contact, open, form]);

  const onSubmit = async (values: ContactFormValues) => {
    await onSave({
      full_name: values.full_name,
      position: values.position,
      email: values.email,
      phone: values.phone || null,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-neutral-950 rounded-lg m-4 border border-neutral-800">
        <SheetHeader>
          <SheetTitle>{contact ? "Edit Contact" : "Add Contact"}</SheetTitle>
          <SheetDescription>
            {contact ? "Update the contact information" : "Add a new contact to the team"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 flex flex-col gap-3 h-full">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optinal)</FormLabel>
                  <IMaskInput
                    mask="(000) 000-0000"
                    value={field.value}
                    onAccept={(value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    placeholder="(416) 778-0014"
                    className="h-9 px-3 py-5 w-full rounded-md border border-neutral-800 text-white bg-neutral-900"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </FormItem>
              )}
            />

            <div className="pt-4 flex flex-col gap-3 mt-auto mb-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
