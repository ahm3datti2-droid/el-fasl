// EL FASL — protected-area layout: server-side session check.
// The proxy redirects guests first; this is the authoritative second check so
// protected content is never rendered (or sent) without a valid session.
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <AppShell user={user} demo={user.demo}>
      {children}
    </AppShell>
  );
}
