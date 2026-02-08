"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { getDonationFunds } from "@/lib/api/funds";
import { useQuery } from "@tanstack/react-query";
import { DonationFund } from "@/types/modules";

type Fund = "zekat" | "sadaka" | "general" | "cenaze" | "fitre";

type Values = {
  email: string;
  amount: string;
  mode: "payment" | "subscription";
};

export default function Donation() {
  const container = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const [selectedFund, setSelectedFund] = useState<Fund>("zekat");
  const [open, setOpen] = useState(false);

  const { data: funds = [], isLoading } = useQuery<DonationFund[]>({
    queryKey: ["donation-funds"],
    queryFn: getDonationFunds,
    staleTime: 1000 * 60 * 5, // 5 dk
  });
  const chunkFunds = <T,>(arr: T[], size = 2): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };
  const fundGroups = chunkFunds(funds, 2);

  const selectedFundData = funds.find((f) => f.slug === selectedFund);

  function openFor(f: Fund) {
    setSelectedFund(f);
    setOpen(true);
  }

  const form = useForm<Values>({
    defaultValues: { email: "", amount: "", mode: "payment" },
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { amount, email, mode } = form.getValues();

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({ amount: Math.round(Number(amount) * 100), fund: selectedFund, email, mode }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data?.error ?? "Checkout error");

      // API { url: session.url } döndürüyor → yönlendir
      if (data?.url) window.location.assign(data.url);
      else throw new Error("redirect URL missing");
    } catch (e: any) {
      alert(e?.message ?? "Unknown error");
    } finally {
    }
  }

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      id="about"
      className="container flex flex-col items-center gap-3 py-8 lg:py-32 lg:text-center"
    >
      <motion.p className="text-4xl md:text-6xl font-bold" variants={item}>
        Bağış
      </motion.p>
      <motion.p className="text-lg text-center" variants={item}>
        Sadaka ve zekâtlarını camimiz üzerinden yapmak isteyenler ile camimizin ihtiyaçlarına katkıda bulunmak
        isteyenler, uygun bağış seçeneklerinden dilediklerini tercih ederek destek olabilirler.
      </motion.p>

      {fundGroups.map((group, index) => {
        // ÇİFT (2 tane fund)
        if (group.length === 2) {
          const [left, right] = group;

          return (
            <div key={index} className="flex flex-col lg:flex-row justify-between items-center gap-12 mt-10">
              {/* LEFT */}
              <div className="md:w-2/5 flex flex-col items-start lg:items-center gap-3">
                <motion.p className="text-4xl md:text-6xl font-bold" variants={item}>
                  {left.title}
                </motion.p>
                <motion.p className="font-semibold" variants={item}>
                  {left.description}
                </motion.p>
                <motion.div variants={item}>
                  <Button size="lg" onClick={() => openFor(left.slug)}>
                    {left.title} <ArrowRight size={20} />
                  </Button>
                </motion.div>
              </div>

              <motion.hr variants={item} className="hidden md:block w-[1px] h-72 lg:block bg-gray-200" />

              {/* RIGHT */}
              <div className="md:w-2/5 flex flex-col items-start lg:items-center gap-3">
                <motion.p className="text-4xl md:text-6xl font-bold" variants={item}>
                  {right.title}
                </motion.p>
                <motion.p className="font-semibold" variants={item}>
                  {right.description}
                </motion.p>
                <motion.div variants={item}>
                  <Button size="lg" onClick={() => openFor(right.slug)}>
                    {right.title} <ArrowRight size={20} />
                  </Button>
                </motion.div>
              </div>
            </div>
          );
        }

        // TEK (son kalan)
        const fund = group[0];

        return (
          <div key={index} className="md:w-2/5 flex flex-col items-start lg:items-center gap-3 mr-auto mt-10">
            <motion.p className="text-4xl md:text-6xl font-bold" variants={item}>
              {fund.title}
            </motion.p>
            <motion.p className="font-semibold" variants={item}>
              {fund.description}
            </motion.p>
            <motion.div variants={item}>
              <Button size="lg" onClick={() => openFor(fund.slug)}>
                {fund.title} <ArrowRight size={20} />
              </Button>
            </motion.div>
          </div>
        );
      })}

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="md:w-1/3 mx-auto bg-foreground text-background border-2 border-gray-200 rounded-3xl! px-4 overflow-hidden mb-1">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-semibold text-background">{selectedFundData?.title}</DrawerTitle>

            <DrawerDescription className="font-semibold text-background">
              {selectedFundData?.description}
            </DrawerDescription>
          </DrawerHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-5">
              {/* email */}
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

              {/* amount (CAD) */}
              <FormField
                control={form.control}
                name="amount"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tutar (CAD) *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step="0.01" placeholder="50" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* mode */}
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tür *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        className="flex items-center gap-6"
                        onValueChange={(v) => field.onChange(v as Values["mode"])}
                        value={field.value}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="once" value="payment" />
                          <label htmlFor="once">Tek sefer</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="monthly" value="subscription" />
                          <label htmlFor="monthly">Aylık</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button variant={"secondary"} type="submit" className="w-full">
                Devam et
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
    </motion.section>
  );
}
