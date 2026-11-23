// EL FASL — session refresh helper used by src/proxy.ts.
// Mirrors the official @supabase/ssr proxy pattern: refresh the session on every
// request so Server Components see a valid user, and hand the response (with any
// refreshed cookies) back to the proxy.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./client";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return { response: supabaseResponse, user: null, supabase: null };
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() both validates the session and refreshes it when needed.
  // Never trust a raw cookie value without this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user, supabase };
}
