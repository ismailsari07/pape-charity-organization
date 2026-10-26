import { initReveal } from "@/lib/reveal";
import RevealOnNavigate from "./RevealOnNavigate";

/**
 * Once per layout, after the content. The inline script runs while the HTML is
 * parsed (first load) and then watches the DOM for content rendered later;
 * RevealOnNavigate starts it when the layout itself arrived by client-side
 * navigation (React does not run inline scripts then).
 */
export default function RevealScript() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `(${initReveal.toString()})()` }} />
      <RevealOnNavigate />
    </>
  );
}
