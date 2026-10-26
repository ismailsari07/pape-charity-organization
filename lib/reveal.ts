// Entrance animations ("reveal") on every public page. Elements opt in with
// data-reveal="up" (rise) or data-reveal="right" (slide in from the right),
// optionally style={{ "--reveal-delay": "70ms" }}; app/globals.css holds the
// animation. Nothing is hidden unless this ran: it adds `reveal-on` to <html>
// only when IntersectionObserver exists and the visitor allows motion, so
// without JavaScript (or with reduced motion) everything is simply visible.
//
import type { CSSProperties } from "react";

// initReveal must stay self-contained (no imports, no outer variables): it is
// also inlined as a <script> (RevealScript) so above-the-fold content starts
// animating before React hydrates.

export function initReveal() {
  try {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("reveal-on");
    const w = window as unknown as { __revealIO?: IntersectionObserver; __revealMO?: MutationObserver };
    const io =
      w.__revealIO ??
      (w.__revealIO = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.setAttribute("data-revealed", ""); // once: never hidden again
            w.__revealIO?.unobserve(e.target);
          }
        },
        { rootMargin: "0px 0px -5% 0px" },
      ));
    const scan = () =>
      document.querySelectorAll("[data-reveal]:not([data-revealed]):not([data-reveal-watched])").forEach((el) => {
        el.setAttribute("data-reveal-watched", "");
        const r = el.getBoundingClientRect();
        // Already on screen: start now (no waiting for the observer's first callback).
        if (r.top < window.innerHeight && r.bottom > 0) el.setAttribute("data-revealed", "");
        else io.observe(el);
      });
    scan();
    // Content rendered later (client-side navigation, /community tabs) is
    // picked up by watching the DOM; one scan per frame at most.
    if (!w.__revealMO) {
      let queued = false;
      w.__revealMO = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          scan();
        });
      });
      w.__revealMO.observe(document.body, { childList: true, subtree: true });
    }
  } catch {
    // Never leave content hidden.
    document.documentElement.classList.remove("reveal-on");
  }
}

/** Props for an element that should reveal: `{...reveal("up", i * 70)}`. */
export function reveal(kind: "up" | "right", delayMs = 0) {
  return {
    "data-reveal": kind,
    ...(delayMs ? { style: { "--reveal-delay": `${delayMs}ms` } as CSSProperties } : {}),
  };
}
