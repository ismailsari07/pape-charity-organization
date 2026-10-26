import Image from "next/image";
import Link from "next/link";
import { t } from "@/lib/i18n";

/** The app's mosque icon with the site name, linking home. */
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={t.nav.home}>
      <Image src="/brand/app-icon.png" alt="" width={44} height={44} className="size-11 rounded-[12px]" priority />
      <span className="flex flex-col leading-tight">
        <span className="text-[17px] font-extrabold text-pm-text">{t.site.name}</span>
        <span className="text-xs font-medium text-pm-muted">{t.site.legalName}</span>
      </span>
    </Link>
  );
}
