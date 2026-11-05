import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, routeRequest } from "@/lib/i18n/config";

function fromOwnSite(req: NextRequest): boolean {
  const referer = req.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).host === req.headers.get("host");
  } catch {
    return false;
  }
}

// Pages stay cacheable: only this middleware reads the cookie, never a page.
export function middleware(req: NextRequest) {
  // A link on our own site (the logo on a Turkish page) means what it says. Client-side
  // navigations are fetches; a click before hydration or in a new tab is a page load from our own URL.
  const mode = req.headers.get("sec-fetch-mode");
  const isPageLoad = mode === null || mode === "navigate";
  const decision = routeRequest(req.nextUrl.pathname, req.cookies.get(LANG_COOKIE)?.value, isPageLoad && !fromOwnSite(req));
  if (decision.kind === "next") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = decision.to;
  if (decision.kind === "rewrite") return NextResponse.rewrite(url);

  const res = NextResponse.redirect(url, decision.status);
  // Depends on this visitor's cookie.
  if (decision.status === 307) res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/((?!api(?:/|$)|_next/|opengraph-image|.*\\..*).*)"],
};
