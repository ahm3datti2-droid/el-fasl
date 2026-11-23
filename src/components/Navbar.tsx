// EL FASL — top navigation. Public variant (landing) or authed variant.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { signOutAction } from "@/lib/auth";
import type { SessionUser } from "@/lib/data";
import { Button } from "./ui";

const AUTH_LINKS = [
  { href: "/dashboard", label: "لوحتي", icon: LayoutDashboard },
  { href: "/challenges", label: "التحديات", icon: Trophy },
  { href: "/ideas", label: "الأفكار", icon: Users },
  { href: "/league", label: "الدوري", icon: Trophy },
];

export default function Navbar({ user, demo }: { user: SessionUser | null; demo?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `el-fasl-theme=${next ? "dark" : "light"}; path=/; max-age=31536000; SameSite=Lax`;
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOutAction();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-navy/90">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-accent text-white shadow-md shadow-electric/30">
            <GraduationCap className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-navy dark:text-white">الفصل</span>
            <span className="block text-[11px] font-bold tracking-widest text-electric">
              EL FASL
            </span>
          </span>
          {demo && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              تجريبي
            </span>
          )}
        </Link>

        {user ? (
          <>
            <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
              {AUTH_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    pathname === href || pathname.startsWith(`${href}/`)
                      ? "bg-electric/10 text-electric"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-light"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"}
                className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-light"
              >
                {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>
              <Link
                href="/notifications"
                aria-label="الإشعارات"
                className="relative flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-light"
              >
                <Bell className="size-5" />
                <span className="absolute end-2 top-2 size-2 rounded-full bg-accent" />
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="القائمة الشخصية"
                  className="flex size-10 items-center justify-center rounded-full bg-electric text-sm font-bold text-white"
                >
                  {initials || <User className="size-5" />}
                </button>
                {profileOpen && (
                  <div className="absolute end-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-navy-light">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                      <p className="truncate text-sm font-bold text-navy dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-navy"
                    >
                      <User className="size-4" /> الملف الشخصي
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-navy"
                    >
                      <Settings className="size-4" /> الإعدادات
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <LogOut className="size-4" /> تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="القائمة"
                className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-navy-light"
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
            {menuOpen && (
              <nav
                className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-navy"
                aria-label="قائمة الهاتف"
              >
                {AUTH_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-navy-light"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"}
              className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-light"
            >
              {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/register" className="hidden sm:block">
              <Button size="sm">إنشاء حساب</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
