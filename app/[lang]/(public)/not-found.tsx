"use client";

import { CompassIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n/LangProvider";
import StatusCard from "@/components/site/StatusCard";

// Every 404 of the public pages: unknown URLs ([...missing]) and every
// notFound() (unpublished or expired items, switched-off sections). A client
// component because a not-found file gets no params; the language comes from
// the provider in the root layout.
export default function NotFound() {
  const { lang, t } = useI18n();
  return (
    <StatusCard icon={<CompassIcon size={26} />} eyebrow={t.notFound.eyebrow} title={t.notFound.title} actions={[{ href: localePath(lang, "/"), label: t.common.home, primary: true }]}>
      <p>{t.notFound.text}</p>
    </StatusCard>
  );
}
