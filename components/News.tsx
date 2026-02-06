"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { SubscribeFormValues, subscribeSchema } from "@/app/(protected)/admin/email/schema/subscribe.schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { IMaskInput } from "react-imask";

export default function News() {
  const [open, setOpen] = useState(false);

  const form = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  function handleSubmit(data: SubscribeFormValues) {
    subscribeMutation.mutate(data);
  }

  const subscribeMutation = useMutation({
    mutationFn: async (payload: SubscribeFormValues) => {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Subscription failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Email listemize başarıyla abone oldunuz! Teşekkürler!");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
      setOpen(false);
    },
  });

  return (
    <section id="news" className="flex flex-col md:flex-row justify-between items-center max-md:gap-7 py-16 md:py-32">
      <div className="md:w-1/2 flex flex-col gap-2 text-left">
        <h3 className="text-4xl md:text-6xl font-semibold">İletişimde Kalın</h3>
        <p className="text-lg">
          Topluluk haberleri, etkinlik davetleri ve önemli duyurular için abone olun. Gizliliğinize saygı duyuyoruz ve
          yalnızca anlamlı bilgilendirmeler gönderiyoruz.
        </p>
      </div>
      <div className="grid w-full max-w-sm items-center gap-3">
        <Button variant={"default"} size={"lg"} onClick={() => setOpen(true)}>
          Abone Ol
        </Button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="md:w-1/3 mx-auto bg-foreground text-background border-2 border-gray-200 rounded-3xl! px-4 overflow-hidden mb-1">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-semibold text-background">Hoş Geldiniz!</DrawerTitle>
            <DrawerDescription className="font-semibold text-background">
              Email listemize katıldığınız için teşekkür ederiz!
            </DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="name"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Your Name" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@eposta.com" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <IMaskInput
                        mask="(000) 000-0000"
                        value={field.value}
                        onAccept={(value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        placeholder="(416) 778-0014"
                        className="h-9 px-3 py-5 w-full rounded-md border border-neutral-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant={"secondary"} type="submit" className="w-full" disabled={subscribeMutation.isPending}>
                {subscribeMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </form>
          </Form>
          <DrawerFooter className="px-0">
            <DrawerClose asChild>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Iptal Et
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </section>
  );
}
