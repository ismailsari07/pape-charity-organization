"use client";

import { useEffect } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import StatusCard from "@/components/site/StatusCard";

// Error boundary for the public pages (inside the header/footer layout).
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
        { href: "/", label: t.common.home },
      ]}
    >
      <p>{t.error.text}</p>
    </StatusCard>
  );
}
