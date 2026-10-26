"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { HeartIcon, LockIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useVisualViewportInset } from "@/hooks/use-visual-viewport-inset";
import { t } from "@/lib/i18n";
import type { DonationFund } from "@/lib/server/funds";

type Values = {
  email: string;
  amount: string;
  mode: "payment" | "subscription";
};

const inputClass =
  "h-12 rounded-[14px] border-pm-line bg-white/[0.04] px-4 text-base text-pm-text placeholder:text-pm-muted focus-visible:border-pm-mint/60 focus-visible:ring-pm-mint/20";

/**
 * Fund cards and the donation drawer. Only the look changed in the redesign:
 * the drawer, the ?fund= deep link, the iOS keyboard handling and the
 * /api/checkout request (body, headers) are exactly as before.
 */
export default function DonationFunds({ funds }: { funds: DonationFund[] }) {
  const [selectedFund, setSelectedFund] = useState<string>(funds[0]?.slug ?? "");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const selectedFundData = funds.find((f) => f.slug === selectedFund);

  function openFor(f: string) {
    setSelectedFund(f);
    setError(null);
    setOpen(true);
  }

  // Deep link: /donation?fund=<slug> opens that fund's drawer once (active funds only)
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current || funds.length === 0) return;
    deepLinkHandled.current = true;
    const slug = new URLSearchParams(window.location.search).get("fund")?.trim().toLowerCase();
    const match = funds.find((f) => f.slug === slug);
    if (match) openFor(match.slug);
  }, [funds]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("fund")) {
      url.searchParams.delete("fund");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
  }

  // iOS keyboard: keep the drawer inside the visible area and the focused field in view.
  // vaul's repositionInputs is disabled because it ignores Safari's viewport panning (drawer slid off the top).
  const viewportInset = useVisualViewportInset(open);
  const drawerBodyRef = useRef<HTMLDivElement>(null);
  const revealFocusedField = useCallback(() => {
    const body = drawerBodyRef.current;
    const el = document.activeElement;
    if (!body || !(el instanceof HTMLElement) || !body.contains(el)) return;
    const field = el.closest<HTMLElement>('[data-slot="form-item"]') ?? el;
    const b = body.getBoundingClientRect();
    const f = field.getBoundingClientRect();
    const pad = 12;
    if (f.top < b.top + pad) body.scrollTop -= b.top + pad - f.top;
    else if (f.bottom > b.bottom - pad) body.scrollTop += f.bottom - (b.bottom - pad);
  }, []);
  useEffect(() => {
    const id = requestAnimationFrame(revealFocusedField);
    return () => cancelAnimationFrame(id);
  }, [viewportInset?.bottom, viewportInset?.height, revealFocusedField]);

  const form = useForm<Values>({
    defaultValues: { email: "", amount: "", mode: "payment" },
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { amount, email, mode } = form.getValues();
    setError(null);
    setPending(true);

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
      if (!res.ok) throw new Error(data?.error ?? "Checkout error");

      // The API returns { url: session.url } → go to Stripe Checkout
      if (data?.url) window.location.assign(data.url);
      else throw new Error("redirect URL missing");
    } catch (e: any) {
      // Shown in the drawer instead of a browser alert.
      setError(e?.message ?? "Unknown error");
      setPending(false);
    }
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {funds.map((fund) => (
          <div key={fund.slug} className="flex flex-col gap-3 rounded-[22px] border border-pm-line bg-pm-card p-[26px]">
            <span className="flex size-12 items-center justify-center rounded-[14px] bg-pm-tile text-pm-mint">
              <HeartIcon size={22} aria-hidden />
            </span>
            <h2 className="text-[22px] font-extrabold text-pm-text">{fund.title}</h2>
            {fund.description && <p className="text-[15px] leading-[1.55] text-pm-text-2">{fund.description}</p>}
            <button
              type="button"
              onClick={() => openFor(fund.slug)}
              className="mt-auto inline-flex items-center gap-2 self-start rounded-full bg-pm-green px-5 py-3 text-[15px] font-bold text-white transition-colors hover:bg-pm-green-hover"
            >
              {t.donation.give} <span aria-hidden>→</span>
            </button>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-2 text-sm text-pm-muted">
        <LockIcon size={14} aria-hidden /> {t.donation.secure}
      </p>

      <Drawer open={open} onOpenChange={handleOpenChange} repositionInputs={false}>
        <DrawerContent
          className="mx-auto mb-2 overflow-hidden rounded-[24px]! border border-pm-line bg-pm-card px-5 text-pm-text md:w-[460px]"
          style={
            viewportInset
              ? { bottom: viewportInset.bottom, maxHeight: `min(80vh, ${viewportInset.height - 16}px)` }
              : undefined
          }
        >
          <DrawerHeader className="shrink-0 px-1">
            <DrawerTitle className="text-[22px] font-extrabold text-pm-text">{selectedFundData?.title}</DrawerTitle>
            <DrawerDescription className="text-[15px] text-pm-text-2">{selectedFundData?.description}</DrawerDescription>
          </DrawerHeader>
          <div ref={drawerBodyRef} onFocus={() => requestAnimationFrame(revealFocusedField)} className="min-h-0 overflow-y-auto overscroll-contain px-1">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-5">
                {/* email */}
                <FormField
                  control={form.control}
                  name="email"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="text-sm font-semibold text-pm-text-3">{t.donation.email} *</FormLabel>
                      <FormControl>
                        <Input className={inputClass} type="email" placeholder="ornek@eposta.com" required {...field} />
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
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="text-sm font-semibold text-pm-text-3">{t.donation.amount} *</FormLabel>
                      <FormControl>
                        <Input className={inputClass} type="number" min={1} step="0.01" placeholder="50" required {...field} />
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
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="text-sm font-semibold text-pm-text-3">{t.donation.kind} *</FormLabel>
                      <FormControl>
                        <RadioGroup className="grid grid-cols-2 gap-2" onValueChange={(v) => field.onChange(v as Values["mode"])} value={field.value}>
                          {(
                            [
                              ["once", "payment", t.donation.once],
                              ["monthly", "subscription", t.donation.monthly],
                            ] as const
                          ).map(([id, value, label]) => (
                            <label
                              key={id}
                              htmlFor={id}
                              className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-pm-line bg-white/[0.04] px-4 py-3 text-[15px] font-semibold text-pm-text has-[[data-state=checked]]:border-pm-mint/60"
                            >
                              <RadioGroupItem id={id} value={value} className="border-pm-text-3 text-pm-mint data-[state=checked]:border-pm-mint [&_svg]:fill-pm-mint" />
                              {label}
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <p role="alert" className="rounded-[14px] border border-pm-gold-line bg-pm-gold-bg px-4 py-3 text-sm text-pm-gold-soft">
                    {t.donation.error}: {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-[14px] bg-pm-green px-5 py-3.5 text-base font-bold text-white transition-colors hover:bg-pm-green-hover disabled:opacity-60"
                >
                  {pending ? t.donation.sending : t.donation.continue}
                </button>
              </form>
            </Form>
            <DrawerFooter className="px-0">
              <DrawerClose asChild>
                <button
                  type="button"
                  className="w-full rounded-[14px] border border-pm-line px-5 py-3.5 text-base font-semibold text-pm-text-3 transition-colors hover:text-pm-mint-hover"
                  onClick={() => handleOpenChange(false)}
                >
                  {t.donation.cancel}
                </button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
