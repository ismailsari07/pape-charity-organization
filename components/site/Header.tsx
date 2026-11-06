"use client";

import Link from "next/link";
import { useState } from "react";
import { HeartIcon, MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { localePath } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n/LangProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import type { NavItem } from "./nav";

function DonateButton({ onClick }: { onClick?: () => void }) {
  const { lang, t } = useI18n();
  return (
    <Link
      href={localePath(lang, "/donation")}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-pm-green px-[18px] py-[11px] text-[15px] font-bold whitespace-nowrap text-white transition-colors hover:bg-pm-green-hover"
    >
      <HeartIcon size={16} strokeWidth={2.2} aria-hidden /> {t.nav.donate}
    </Link>
  );
}

export default function Header({ items }: { items: NavItem[] }) {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="border-b border-pm-line">
      <div className="mx-auto flex max-w-[1248px] items-center justify-between gap-4 px-6 py-[18px]">
        <Logo />

        <nav className="hidden shrink-0 items-center gap-1.5 lg:flex">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={cn("rounded-[10px] py-2.5 text-[15px] font-semibold whitespace-nowrap text-pm-nav transition-colors hover:text-pm-mint-hover", lang === "fr" ? "px-1.5 xl:px-3.5" : "px-3.5")}>
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher className="ml-1" />
          <span className="ml-2">
            <DonateButton />
          </span>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          className="flex size-11 items-center justify-center rounded-[14px] border border-pm-line text-pm-text lg:hidden"
        >
          {open ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="mx-auto flex max-w-[1248px] flex-col gap-1 px-6 pb-5 lg:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="rounded-[10px] px-3.5 py-3 text-base font-semibold text-pm-nav transition-colors hover:bg-pm-card hover:text-pm-mint-hover"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher className="px-2 py-2" />
          <div className="mt-2">
            <DonateButton onClick={close} />
          </div>
        </nav>
      )}
    </header>
  );
}
