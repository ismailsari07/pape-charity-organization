import Link from "next/link";
import { reveal } from "@/lib/reveal";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  link?: { href: string; label: string };
  as?: "h1" | "h2";
  /** Entrance animation (lib/reveal.ts): eyebrow + title slide in from the right, intro rises. */
  reveal?: boolean;
};

/** Eyebrow + title (+ intro) with an optional "see all" link on the right. */
export default function SectionHeading({ eyebrow, title, intro, link, as: Tag = "h2", reveal: animate = false }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-2xl flex-col gap-2">
        <span className="flex" {...(animate ? reveal("right") : {})}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </span>
        <Tag className="text-[38px] leading-tight font-extrabold tracking-[-0.8px] text-pm-text" {...(animate ? reveal("right", 60) : {})}>
          {title}
        </Tag>
        {intro && (
          <p className="mt-1 text-[17px] leading-[1.6] text-pm-text-2" {...(animate ? reveal("up", 120) : {})}>
            {intro}
          </p>
        )}
      </div>
      {link && (
        <Link href={link.href} className="text-base font-bold text-pm-mint transition-colors hover:text-pm-mint-hover">
          {link.label} →
        </Link>
      )}
    </div>
  );
}

/** The mint uppercase label above titles. */
export function Eyebrow({ children, className = "text-pm-mint" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-sm font-bold tracking-[1.5px] uppercase ${className}`}>{children}</span>;
}
