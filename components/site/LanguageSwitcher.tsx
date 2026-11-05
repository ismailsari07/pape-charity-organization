"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LANG_COOKIE, LANGS, localePath, stripLang, type Lang } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n/LangProvider";

const YEAR = 60 * 60 * 24 * 365;

/** TR · EN · FR: the same page in another language, by a full page load, and remembered in a cookie. */
export default function LanguageSwitcher({ className }: { className?: string }) {
  const { lang: current, t } = useI18n();
  const path = stripLang(usePathname());

  function choose(e: React.MouseEvent<HTMLAnchorElement>, lang: Lang) {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LANG_COOKIE}=${lang}; Path=/; Max-Age=${YEAR}; SameSite=Lax${secure}`;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.location.assign(localePath(lang, path) + window.location.search + window.location.hash);
  }

  return (
    <nav aria-label={t.nav.language} className={cn("flex items-center gap-1.5 text-sm font-bold", className)}>
      {LANGS.map((lang, i) => (
        <Fragment key={lang}>
          {i > 0 && <span aria-hidden className="text-pm-muted">·</span>}
          <a
            href={localePath(lang, path)}
            hrefLang={lang}
            lang={lang}
            aria-current={lang === current ? "true" : undefined}
            onClick={(e) => choose(e, lang)}
            className={cn("rounded-md px-1.5 py-1 uppercase transition-colors hover:text-pm-mint-hover", lang === current ? "text-pm-mint" : "text-pm-nav")}
          >
            {lang}
          </a>
        </Fragment>
      ))}
    </nav>
  );
}
