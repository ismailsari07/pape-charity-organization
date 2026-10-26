import Image from "next/image";
import Link from "next/link";
import { t } from "@/lib/i18n";
import type { Features, Links } from "@/lib/content/bundle";

export default function Footer({ features, links }: { features: Features; links: Links }) {
  const linkClass = "text-pm-text-2 transition-colors hover:text-pm-mint-hover";
  return (
    <footer className="mt-20 border-t border-pm-line">
      <div className="mx-auto flex max-w-[1248px] flex-wrap items-center justify-between gap-4 px-6 py-7 text-sm text-pm-muted">
        <span className="flex items-center gap-2.5">
          <Image src="/brand/logo-green.png" alt="" width={28} height={28} className="size-7 rounded-[8px]" />
          {t.footer.copyright}
        </span>
        <nav className="flex flex-wrap gap-[18px]">
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
