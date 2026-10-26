import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

type Props = { eyebrow: string; title: string; intro?: string; link?: { href: string; label: string }; as?: "h1" | "h2" };

/** Eyebrow + title (+ intro) with an optional "see all" link on the right. */
export default function SectionHeading({ eyebrow, title, intro, link, as: Tag = "h2" }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-pm-mint">{eyebrow}</p>
        <Tag className="text-3xl font-extrabold tracking-tight text-pm-text md:text-4xl">{title}</Tag>
        {intro && <p className="text-base text-pm-text-2">{intro}</p>}
      </div>
      {link && (
        <Link href={link.href} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-pm-mint transition-colors hover:text-pm-text">
          {link.label} <ArrowRightIcon size={14} aria-hidden />
        </Link>
      )}
    </div>
  );
}
