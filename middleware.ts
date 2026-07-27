import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  // --- TEMPORARY security mitigation (remove with the admin panel) ---
  // These API routes have no auth check of their own and were not covered
  // by the matcher below, leaving them reachable by anyone on the internet
  // (full subscriber list, subscriber delete, and bulk email from our
  // verified domain). Block them outright for now. When the admin panel is
  // removed these routes should go with it — delete this block at that time.
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/admin") || pathname === "/api/send/bulk") {
    return NextResponse.json(
      { error: "This endpoint is temporarily disabled." },
      { status: 403 },
    );
  }

  // Admin route'ları koru
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      // Giriş yapmamış → Login'e yönlendir
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Kullanıcı var, ama admin mi kontrol et
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      // Admin değil → Ana sayfaya yönlendir
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Login sayfasına giriş yapmış kullanıcı gelirse → Admin'e yönlendir
  if (request.nextUrl.pathname === "/login" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*", // Tüm /admin/* route'ları koru
    "/login", // Login sayfası
    "/api/admin/:path*", // TEMP: block open admin API routes (see mitigation above)
    "/api/send/bulk", // TEMP: block open bulk-email route (see mitigation above)
  ],
};
