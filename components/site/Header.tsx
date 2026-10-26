"use client";

import Link from "next/link";
import { useState } from "react";
import { HeartIcon, MenuIcon, XIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import Logo from "./Logo";
import type { NavItem } from "./nav";

function DonateButton({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/donation"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-pm-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-pm-green-hover"
    >
      <HeartIcon size={16} aria-hidden /> {t.nav.donate}
    </Link>
  );
}

export default function Header({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="border-b border-pm-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 md:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="text-[15px] font-semibold text-pm-text-3 transition-colors hover:text-pm-mint">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <DonateButton />
        </div>

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
        <nav id="mobile-menu" className="mx-auto flex max-w-6xl flex-col gap-1 px-4 pb-5 md:px-6 lg:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="rounded-[14px] px-3 py-3 text-base font-semibold text-pm-text-3 transition-colors hover:bg-pm-card hover:text-pm-mint"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2">
            <DonateButton onClick={close} />
          </div>
        </nav>
      )}
    </header>
  );
}
