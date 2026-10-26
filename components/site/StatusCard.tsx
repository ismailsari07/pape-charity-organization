import Link from "next/link";
import type { ReactNode } from "react";
import { reveal } from "@/lib/reveal";

type Action = { href: string; label: string; primary?: boolean } | { onClick: () => void; label: string; primary?: boolean };

/** Centered message card for result pages (donation success/cancel, unsubscribe, 404, error). */
export default function StatusCard({ icon, eyebrow, title, children, actions }: { icon: ReactNode; eyebrow?: string; title: string; children: ReactNode; actions: Action[] }) {
  const cls = (primary?: boolean) =>
    primary
      ? "inline-flex items-center justify-center rounded-full bg-pm-green px-5 py-3 text-[15px] font-bold text-white transition-colors hover:bg-pm-green-hover"
      : "inline-flex items-center justify-center rounded-full border border-pm-line px-5 py-3 text-[15px] font-semibold text-pm-text-3 transition-colors hover:text-pm-mint-hover";
  return (
    <main className="mx-auto flex max-w-[1248px] justify-center px-6 pt-20">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-[24px] border border-pm-line bg-pm-card p-8 text-center md:p-10" {...reveal("up")}>
        <span className="flex size-14 items-center justify-center rounded-[16px] bg-pm-tile text-pm-mint">{icon}</span>
        {eyebrow && <span className="text-sm font-bold tracking-[1.5px] text-pm-mint uppercase">{eyebrow}</span>}
        <h1 className="text-[32px] leading-tight font-extrabold tracking-[-0.6px] text-pm-text">{title}</h1>
        <div className="flex flex-col gap-2 text-[16px] leading-[1.6] text-pm-text-2">{children}</div>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {actions.map((a) =>
            "href" in a ? (
              <Link key={a.label} href={a.href} className={cls(a.primary)}>
                {a.label}
              </Link>
            ) : (
              <button key={a.label} type="button" onClick={a.onClick} className={cls(a.primary)}>
                {a.label}
              </button>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
