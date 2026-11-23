// EL FASL — server-side role helpers for Phase 3 (Community + Admin).
// Server-only module: imports next/headers. Never import from client components.
//
// Demo mode: the demo login sets a `el-fasl-demo-role` cookie (user | moderator | admin).
// Production: Supabase is the source of truth — a Supabase auth cookie proves the
// user is signed in (role "user"). The admin role from the Supabase profile must be
// wired here once the Supabase server client lands (see note in getServerRole);
// until then, admin access in demo mode comes only from the demo cookie, and the
// server — never the client — decides.

import { cookies } from "next/headers";

export type ServerRole = "admin" | "moderator" | "user" | null;

const DEMO_ROLE_COOKIES = ["el-fasl-demo-role", "el-fasl-role"];

function parseRole(value: string | undefined): ServerRole {
  if (value === "admin" || value === "moderator" || value === "user") return value;
  return null;
}

/** Server-side role resolution. Returns null when unauthenticated. */
export async function getServerRole(): Promise<ServerRole> {
  const store = await cookies();

  for (const name of DEMO_ROLE_COOKIES) {
    const role = parseRole(store.get(name)?.value);
    if (role) return role;
  }

  // Supabase session cookie present => signed-in user (base role only).
  // TODO (parent integration): read the Supabase profile here via the server
  // client and return "admin"/"moderator" when profiles.role says so.
  const hasSupabaseSession = store
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (hasSupabaseSession) return "user";

  return null;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getServerRole()) !== null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getServerRole()) === "admin";
}
