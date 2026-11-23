// EL FASL — route guard (Next.js 16: src/proxy.ts, NOT middleware.ts).
// Protected routes redirect to /login when there is no Supabase session and no
// demo cookie. /admin/* additionally requires the admin role (Supabase profile
// or demo cookie). Public routes stay open. The (app) layout re-checks the
// session server-side, so the proxy is a first line of defence, not the only one.
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { parseDemoSession, DEMO_COOKIE } from "@/lib/demo";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/challenges",
  "/simulator",
  "/flip-class",
  "/classroom-tools",
  "/ideas",
  "/teacher-unfiltered",
  "/teacher-help",
  "/league",
  "/notifications",
  "/profile",
  "/settings",
  "/admin",
];

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function copySetCookies(from: NextResponse, to: NextResponse): void {
  for (const cookie of from.headers.getSetCookie()) {
    to.headers.append("set-cookie", cookie);
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes enforce auth inside their own handlers.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const { response, user, supabase } = await updateSession(request);
  // Demo cookie is only honoured while Supabase is NOT configured. Once the
  // real auth is live, a stale demo cookie must not authenticate anyone.
  const demo = isSupabaseConfigured()
    ? null
    : parseDemoSession(request.cookies.get(DEMO_COOKIE)?.value);
  const authed = Boolean(user) || Boolean(demo);

  if (isProtected(pathname) && !authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    // Drop any stale demo cookie so the browser stops sending it.
    if (isSupabaseConfigured()) redirect.cookies.delete(DEMO_COOKIE);
    copySetCookies(response, redirect);
    return redirect;
  }

  if (isAdminRoute(pathname) && authed) {
    let isAdmin = demo?.role === "admin";
    if (!isAdmin && user && supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = profile?.role === "admin";
    }
    if (!isAdmin) {
      const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
      copySetCookies(response, redirect);
      return redirect;
    }
  }

  // Signed-in users don't need the auth pages.
  if (AUTH_PAGES.includes(pathname) && authed) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    copySetCookies(response, redirect);
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
