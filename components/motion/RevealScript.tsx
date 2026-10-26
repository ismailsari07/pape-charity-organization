import { initReveal } from "@/lib/reveal";
import RevealOnNavigate from "./RevealOnNavigate";

/**
 * Put once at the end of a page that uses data-reveal. The inline script runs
 * while the HTML is parsed (first load); RevealOnNavigate covers client-side
 * navigations, where React does not run inline scripts.
 */
export default function RevealScript() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `(${initReveal.toString()})()` }} />
      <RevealOnNavigate />
    </>
  );
}
