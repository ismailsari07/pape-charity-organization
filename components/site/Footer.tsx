import Link from "next/link";
import { t } from "@/lib/i18n";
import type { Features, Links } from "@/lib/content/bundle";
import Logo from "./Logo";

export default function Footer({ features, links }: { features: Features; links: Links }) {
  const linkClass = "text-sm font-semibold text-pm-text-3 transition-colors hover:text-pm-mint";
  return (
    <footer className="mt-24 border-t border-pm-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-pm-muted">{t.footer.copyright}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3">
          {features.announcements && (
            <Link href="/announcements" className={linkClass}>
              {t.footer.announcements}
            </Link>
          )}
          <Link href="/donation" className={linkClass}>
            {t.footer.donate}
          </Link>
          <Link href="/privacy" className={linkClass}>
            {t.footer.privacy}
          </Link>
          {/* Only when the panel has a link (Content → Links → Instagram). */}
          {links.instagram && (
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {t.footer.instagram}
            </a>
          )}
        </nav>
      </div>
    </footer>
  );
}
