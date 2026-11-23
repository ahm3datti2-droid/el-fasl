// EL FASL — Supabase server client (Server Components / Route Handlers / Server Actions).
// Returns null when Supabase env vars are missing so the app can run in demo mode.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "./client";

export async function createClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll may throw from a Server Component (read-only cookies there);
            // the proxy refreshes the session cookies instead.
          }
        },
      },
    },
  );
}
