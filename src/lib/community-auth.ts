// EL FASL — server-side role helpers for Phase 3 (Community + Admin).
// Server-only module: imports next/headers. Never import from client components.
//
// Supabase is the source of truth when configured: the role comes from
// profiles.role via the server client. The demo-role cookies
// (el-fasl-demo-role / el-fasl-role) are honoured ONLY while Supabase is not
// configured; once it is live they are ignored, so nobody can grant
// themselves admin by setting a cookie. The server — never the client — decides.

import { cookies } from "next/headers";
import { isSupabaseConfigured } from "./supabase/client";
import { createClient } from "./supabase/server";

export type ServerRole = "admin" | "moderator" | "user" | null;

const DEMO_ROLE_COOKIES = ["el-fasl-demo-role", "el-fasl-role"];

function parseRole(value: string | undefined): ServerRole {
  if (value === "admin" || value === "moderator" || value === "user") return value;
  return null;
}

/** Server-side role resolution. Returns null when unauthenticated. */
export async function getServerRole(): Promise<ServerRole> {
  const store = await cookies();

  // Production: Supabase is the source of truth. The demo-role cookie is
  // ignored entirely once Supabase is configured — otherwise anyone could
  // set `el-fasl-demo-role=admin` in their browser and become admin.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        const role = profile?.role as ServerRole | undefined;
        return role === "admin" || role === "moderator" ? role : "user";
      }
    }
    return null;
  }

  for (const name of DEMO_ROLE_COOKIES) {
    const role = parseRole(store.get(name)?.value);
    if (role) return role;
  }

  // Supabase session cookie present => signed-in user (base role only).
  const hasSupabaseSession = store
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (hasSupabaseSession) return "user";

  return null;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getServerRole()) !== null;
}

/**
 * True only while the app runs WITHOUT Supabase configured (demo mode).
 * Once Supabase is live every session is a real account, so demo UI
 * (guest banner, DemoNote, seed-data notices) must stay hidden.
 */
export async function isDemoSession(): Promise<boolean> {
  return !isSupabaseConfigured();
}

export async function isAdmin(): Promise<boolean> {
  return (await getServerRole()) === "admin";
}
