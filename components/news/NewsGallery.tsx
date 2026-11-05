"use client";

import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/LangProvider";
import type { NewsPhoto } from "@/lib/news";
import NewsPhotoFrame from "./NewsPhotoFrame";

const smooth = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

/** The slide a horizontal scroller is on, kept in step while it scrolls. */
function useSlides(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const onScroll = () => {
    const el = ref.current;
    if (el && el.clientWidth > 0) setIndex(Math.min(count - 1, Math.round(el.scrollLeft / el.clientWidth)));
  };
  const go = (i: number, behavior: ScrollBehavior = smooth()) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior });
  };
  return { ref, index, setIndex, onScroll, go };
}

const arrow = "absolute top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(10,19,16,0.72)] text-white transition-colors hover:bg-[rgba(10,19,16,0.9)] disabled:opacity-40 lg:flex";

// CSS scroll-snap, no library. A tap opens the photo fullscreen, whole and
// without the fill; the browser's own pinch-to-zoom works there.
export default function NewsGallery({ slides, title }: { slides: NewsPhoto[]; title: string }) {
  const { t } = useI18n();
  const { ref, index, onScroll, go } = useSlides(slides.length);
  const [viewer, setViewer] = useState<number | null>(null);
  const many = slides.length > 1;

  return (
    <section aria-label={t.news.photosLabel} className="flex flex-col gap-1.5">
      <div className="relative overflow-hidden lg:rounded-3xl">
        <div ref={ref} onScroll={onScroll} tabIndex={many ? 0 : undefined} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slides.map((p, i) => (
            <button key={p.url} type="button" onClick={() => setViewer(i)} aria-label={t.news.openFullscreen.replace("{i}", String(i + 1)).replace("{n}", String(slides.length))} className="w-full shrink-0 cursor-zoom-in snap-center snap-always">
              <NewsPhotoFrame photo={p} alt={p.alt ?? title} sizes="(min-width: 1024px) 600px, 100vw" priority={i === 0} />
            </button>
          ))}
        </div>
        {many && (
          <>
            <button type="button" aria-label={t.news.previous} disabled={index === 0} onClick={() => go(index - 1)} className={`${arrow} left-3`}>
              <ChevronLeftIcon size={20} aria-hidden />
            </button>
            <button type="button" aria-label={t.news.next} disabled={index === slides.length - 1} onClick={() => go(index + 1)} className={`${arrow} right-3`}>
              <ChevronRightIcon size={20} aria-hidden />
            </button>
            <span className="pointer-events-none absolute top-3 right-3 rounded-[14px] bg-[rgba(10,19,16,0.8)] px-2.5 py-1 text-xs font-bold text-white">
              {index + 1} / {slides.length}
            </span>
          </>
        )}
      </div>
      {many && (
        <div className="flex justify-center py-1">
          {slides.map((p, i) => (
            <button key={p.url} type="button" aria-label={t.news.goTo.replace("{i}", String(i + 1))} aria-current={i === index ? "true" : undefined} onClick={() => go(i)} className="p-1.5">
              <span className={`block size-2 rounded-full ${i === index ? "bg-pm-mint" : "bg-[#3b4a44]"}`} />
            </button>
          ))}
        </div>
      )}
      {viewer !== null && <Viewer slides={slides} title={title} start={viewer} onClose={(i) => { setViewer(null); go(i, "auto"); }} />}
    </section>
  );
}

function Viewer({ slides, title, start, onClose }: { slides: NewsPhoto[]; title: string; start: number; onClose: (index: number) => void }) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const { ref, index, onScroll, go, setIndex } = useSlides(slides.length);
  const many = slides.length > 1;

  useEffect(() => {
    dialog.current?.showModal();
    setIndex(start);
    go(start, "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on opening
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose(index);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" && index < slides.length - 1) go(index + 1);
        if (e.key === "ArrowLeft" && index > 0) go(index - 1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
    >
      <div ref={ref} onScroll={onScroll} className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slides.map((p) => (
          <div key={p.url} className="relative h-full w-full shrink-0 snap-center snap-always">
            <Image src={p.url} alt={p.alt ?? title} fill sizes="100vw" className="object-contain" />
          </div>
        ))}
      </div>
      <button type="button" autoFocus aria-label={t.news.close} onClick={() => onClose(index)} className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
        <XIcon size={20} aria-hidden />
      </button>
      {many && (
        <>
          <button type="button" aria-label={t.news.previous} disabled={index === 0} onClick={() => go(index - 1)} className={`${arrow} left-3`}>
            <ChevronLeftIcon size={20} aria-hidden />
          </button>
          <button type="button" aria-label={t.news.next} disabled={index === slides.length - 1} onClick={() => go(index + 1)} className={`${arrow} right-3`}>
            <ChevronRightIcon size={20} aria-hidden />
          </button>
          <span className="pointer-events-none absolute inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] text-center text-[13px] text-white/85">
            {index + 1} / {slides.length}
          </span>
        </>
      )}
    </dialog>
  );
}
