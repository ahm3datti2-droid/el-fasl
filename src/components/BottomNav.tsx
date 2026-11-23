// EL FASL — mobile bottom navigation (visible on small screens only).
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Trophy, User, Users, Wrench } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "الرئيسية", icon: House },
  { href: "/challenges", label: "التحديات", icon: Trophy },
  { href: "/classroom-tools", label: "أدوات الفصل", icon: Wrench },
  { href: "/ideas", label: "المجتمع", icon: Users },
  { href: "/profile", label: "حسابي", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-navy/95"
      aria-label="التنقل السفلي"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-electric" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
