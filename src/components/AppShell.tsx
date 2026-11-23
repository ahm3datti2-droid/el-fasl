// EL FASL — protected-area shell: navbar + optional demo banner + bottom nav.
import type { ReactNode } from "react";
import Link from "next/link";
import type { SessionUser } from "@/lib/data";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";

export default function AppShell({
  user,
  demo,
  children,
}: {
  user: SessionUser;
  demo?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} demo={demo} />
      {demo && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">
          وضع تجريبي — اربط Supabase للتفعيل الكامل. جرّب الدخول بحساب{" "}
          <span dir="ltr">admin@elfasl.app</span> لعرض لوحة الإدارة.
        </div>
      )}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:pb-12">{children}</main>
      <footer className="hidden border-t border-slate-200 py-5 text-center text-xs text-slate-500 md:block dark:border-slate-800">
        <Link href="/dashboard" className="font-bold text-electric">
          EL FASL | الفصل
        </Link>{" "}
        — مش مجرد شرح.. تجربة مختلفة كل يوم.
      </footer>
      <BottomNav />
    </div>
  );
}
