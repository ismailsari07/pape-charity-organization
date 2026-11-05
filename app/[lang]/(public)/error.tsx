"use client";

import { useEffect } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { localePath } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n/LangProvider";
import StatusCard from "@/components/site/StatusCard";

// Error boundary for the public pages (inside the header/footer layout).
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { lang, t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <StatusCard
      icon={<TriangleAlertIcon size={26} />}
      eyebrow={t.error.eyebrow}
      title={t.error.title}
      actions={[
        { onClick: reset, label: t.error.retry, primary: true },
        { href: localePath(lang, "/"), label: t.common.home },
      ]}
    >
      <p>{t.error.text}</p>
    </StatusCard>
  );
}
