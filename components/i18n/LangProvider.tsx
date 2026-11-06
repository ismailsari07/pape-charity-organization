"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DATE_LOCALES, type Lang } from "@/lib/i18n/config";
import type { ClientMessages } from "@/lib/i18n";

const LangContext = createContext<{ lang: Lang; t: ClientMessages } | null>(null);

/** Gives client components the page's language and its strings (see clientMessages). */
export default function LangProvider({ lang, messages, children }: { lang: Lang; messages: ClientMessages; children: ReactNode }) {
  return <LangContext.Provider value={{ lang, t: messages }}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const value = useContext(LangContext);
  if (!value) throw new Error("useI18n outside LangProvider");
  return { ...value, dateLocale: DATE_LOCALES[value.lang] };
}
