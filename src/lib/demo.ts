// EL FASL — demo-mode session helpers (used when Supabase env vars are missing).
// The demo session is a plain JSON payload, URI-encoded into an httpOnly cookie.
// It never contains a password or a token. Server actions set it; proxy + layout read it.
import type { SessionUser, UserRole } from "./data";

export const DEMO_COOKIE = "el-fasl-demo";
export const DEMO_ADMIN_EMAIL = "admin@elfasl.app";

export interface DemoSession {
  name: string;
  email: string;
  role: UserRole;
}

export function encodeDemoSession(session: DemoSession): string {
  return encodeURIComponent(JSON.stringify(session));
}

export function parseDemoSession(value: string | undefined | null): DemoSession | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Record<string, unknown>).email === "string" &&
      typeof (parsed as Record<string, unknown>).name === "string"
    ) {
      const p = parsed as Record<string, unknown>;
      const role = p.role === "admin" || p.role === "moderator" ? (p.role as UserRole) : "user";
      return { name: p.name as string, email: p.email as string, role };
    }
    return null;
  } catch {
    return null;
  }
}

export function demoSessionToUser(session: DemoSession): SessionUser {
  return {
    id: `demo-${session.email}`,
    email: session.email,
    name: session.name,
    role: session.role,
    specialization: null,
    stage: null,
    subject: null,
    governorate: null,
    xp: 120,
    demo: true,
  };
}

/** Demo role: the admin demo email gets the admin role, everyone else is a user. */
export function demoRoleForEmail(email: string): UserRole {
  return email.trim().toLowerCase() === DEMO_ADMIN_EMAIL ? "admin" : "user";
}
