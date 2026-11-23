// EL FASL — auth pages shell: centered card under the brand header.
import type { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-soft dark:bg-[#0b1220]">
      <header className="mx-auto flex w-full max-w-md items-center justify-center gap-2.5 pt-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-accent text-white shadow-md shadow-electric/30">
            <GraduationCap className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-xl font-extrabold text-navy dark:text-white">الفصل</span>
            <span className="block text-[11px] font-bold tracking-widest text-electric">
              EL FASL
            </span>
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="pb-6 text-center text-xs text-slate-500">
        مش مجرد شرح.. تجربة مختلفة كل يوم.
      </footer>
    </div>
  );
}
