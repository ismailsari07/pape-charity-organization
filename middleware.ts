import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, routeRequest } from "@/lib/i18n/config";

// Pages stay cacheable: only this middleware reads the cookie, never a page.
export function middleware(req: NextRequest) {
  // Client-side navigations are fetches; a page load is "navigate" (or has no such header).
  const mode = req.headers.get("sec-fetch-mode");
  const decision = routeRequest(req.nextUrl.pathname, req.cookies.get(LANG_COOKIE)?.value, mode === null || mode === "navigate");
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
