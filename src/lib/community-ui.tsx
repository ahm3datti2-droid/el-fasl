// EL FASL — shared client UI for Phase 3 (Community + Admin).
// Self-contained: AppShell (header + bottom nav + demo banner), small UI helpers,
// and the interactive Admin client components. No imports from other agents' files.
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Bell,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Flag,
  GraduationCap,
  Heart,
  Home,
  Lightbulb,
  MessageCircle,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  ADMIN_STATS,
  BADGES,
  LEVELS,
  POINTS_RULES,
  challengeSchema,
  type AdminUserRow,
  type AnonymousPost,
  type ChallengeRow,
  type ReportRow,
  type ScenarioRow,
} from "./community-data";

// ---------------------------------------------------------------------------
// Demo-mode cookie helpers (client side). The cookie is the demo credential;
// the server re-checks it on every guarded request — the client never decides.
// ---------------------------------------------------------------------------

export type DemoRole = "admin" | "moderator" | "user";

export function readDemoRole(): DemoRole | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)el-fasl-demo-role=(admin|moderator|user)/);
  return match ? (match[1] as DemoRole) : null;
}

export function setDemoRole(role: DemoRole | null) {
  if (typeof document === "undefined") return;
  if (role) {
    document.cookie = `el-fasl-demo-role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = "el-fasl-demo-role=; path=/; max-age=0; SameSite=Lax";
  }
}

// ---------------------------------------------------------------------------
// Tiny toast hook
// ---------------------------------------------------------------------------

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);
  const toast = (m: string) => setMsg(m);
  return { msg, toast };
}

function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#101828] px-5 py-2.5 text-sm font-bold text-white shadow-xl md:bottom-8">
      {msg}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppShell — header + mobile bottom nav + demo banner
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { href: "/dashboard", label: "الرئيسية", icon: Home, key: "dashboard" },
  { href: "/challenges", label: "التحديات", icon: Trophy, key: "challenges" },
  { href: "/classroom-tools", label: "أدوات الفصل", icon: Wrench, key: "tools" },
  { href: "/ideas", label: "المجتمع", icon: Users, key: "community" },
  { href: "/profile", label: "حسابي", icon: User, key: "profile" },
];

const DESKTOP_LINKS = [
  { href: "/dashboard", label: "الرئيسية" },
  { href: "/challenges", label: "التحديات" },
  { href: "/simulator", label: "محاكي المدرس" },
  { href: "/flip-class", label: "اقلب الحصة" },
  { href: "/classroom-tools", label: "أدوات الفصل" },
  { href: "/ideas", label: "مصنع الأفكار" },
  { href: "/teacher-unfiltered", label: "فضفضة مدرس" },
  { href: "/teacher-help", label: "مدرس يساعد مدرس" },
  { href: "/league", label: "الدوري" },
];

export function AppShell({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle?: string;
  active: string;
  children: ReactNode;
}) {
  const [demoRole, setDemoRoleState] = useState<DemoRole | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDemoRoleState(readDemoRole());
  }, []);

  const enterGuestMode = () => {
    setDemoRole("user");
    setDemoRoleState("user");
    window.location.reload();
  };

  return (
    <div dir="rtl" lang="ar" style={{ fontFamily: "'Cairo', system-ui, -apple-system, sans-serif" }} className="min-h-screen bg-[#F5F7FB] text-[#101828]">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" />
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4568FF] text-white shadow-lg shadow-blue-200">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-black">الفصل</span>
              <span className="block text-[10px] font-bold tracking-widest text-[#7C5CFC]">EL FASL</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 overflow-x-auto lg:flex">
            {DESKTOP_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold text-gray-600 transition hover:bg-[#F5F7FB] hover:text-[#4568FF]">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/notifications" aria-label="الإشعارات" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F7FB] text-gray-700 transition hover:bg-blue-50 hover:text-[#4568FF]">
              <Bell className="h-5 w-5" />
              <span className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </Link>
            <Link href="/profile" aria-label="حسابي" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C5CFC] font-black text-white">
              أ
            </Link>
          </div>
        </div>
      </header>

      {mounted && !demoRole && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm font-bold text-amber-800">
          أنت في وضع العرض التجريبي — المحتوى تجريبي حتى تفعيل حساب Supabase.{" "}
          <button onClick={enterGuestMode} className="mr-1 rounded-full bg-amber-600 px-3 py-1 text-xs font-black text-white hover:bg-amber-700">
            دخول كضيف تجريبي
          </button>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:pb-12">
        <div className="mb-5">
          <h1 className="text-2xl font-black md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm font-semibold text-gray-500 md:text-base">{subtitle}</p>}
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <Link key={item.key} href={item.href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold ${isActive ? "text-[#4568FF]" : "text-gray-400"}`}>
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small shared bits
// ---------------------------------------------------------------------------

export function DemoNote({ text }: { text?: string }) {
  return (
    <div className="mb-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        {text ?? "وضع تجريبي: الصلاحيات هنا من كوكي العرض التجريبي، والبيانات Seed تجريبية. عند ربط Supabase تُستبدل بصلاحيات وبيانات حقيقية من قاعدة البيانات."}
      </span>
    </div>
  );
}

export function Chip({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "blue" | "violet" | "green" | "amber" | "red" }) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-[#4568FF]",
    violet: "bg-violet-50 text-[#7C5CFC]",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function StatCard({ label, value, hint, icon, color }: { label: string; value: string; hint?: string; icon: ReactNode; color: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${color}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-black">{value}</p>
      {hint && <p className="mt-1 text-xs font-semibold text-gray-400">{hint}</p>}
    </div>
  );
}

export function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <AppShell title={title} subtitle={subtitle} active="admin">
      <DemoNote />
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { href: "/admin", label: "نظرة عامة" },
          { href: "/admin/users", label: "المستخدمون" },
          { href: "/admin/challenges", label: "التحديات" },
          { href: "/admin/situations", label: "السيناريوهات" },
          { href: "/admin/posts", label: "المنشورات" },
          { href: "/admin/reports", label: "البلاغات" },
          { href: "/admin/settings", label: "الإعدادات" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-[#4568FF] hover:text-white">
            {l.label}
          </Link>
        ))}
      </div>
      {children}
    </AppShell>
  );
}

// Re-exported for admin pages that need the stats constant in client code.
export { ADMIN_STATS };

// ---------------------------------------------------------------------------
// Admin client components
// ---------------------------------------------------------------------------

export function AdminUsersClient({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const { msg, toast } = useToast();

  const filtered = users.filter(
    (u) => u.name.includes(query) || u.email.toLowerCase().includes(query.toLowerCase()) || u.specialization.includes(query),
  );

  const updateUser = (id: string, patch: Partial<AdminUserRow>, note: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    toast(note);
  };

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm md:p-6">
      <Toast msg={msg} />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-black">المستخدمون ({users.length})</h2>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو البريد أو التخصص..."
            className="w-full rounded-full border border-gray-200 bg-[#F5F7FB] py-2.5 pl-4 pr-10 text-sm font-semibold outline-none focus:border-[#4568FF] md:w-80"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead>
            <tr className="border-b text-xs text-gray-400">
              <th className="py-3 font-bold">المستخدم</th>
              <th className="py-3 font-bold">التخصص / المرحلة</th>
              <th className="py-3 font-bold">الدور</th>
              <th className="py-3 font-bold">الحالة</th>
              <th className="py-3 font-bold">XP</th>
              <th className="py-3 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3">
                  <p className="font-black">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="py-3 font-semibold text-gray-600">{u.specialization} — {u.stage}</td>
                <td className="py-3">
                  <select
                    value={u.role}
                    onChange={(e) => {
                      const role = e.target.value as AdminUserRow["role"];
                      if (window.confirm(`تغيير دور ${u.name} إلى ${role === "admin" ? "مشرف عام" : role === "moderator" ? "مشرف محتوى" : "مستخدم"}؟`)) {
                        updateUser(u.id, { role }, `تم تغيير دور ${u.name}`);
                      }
                    }}
                    className="rounded-full border border-gray-200 bg-white px-2 py-1.5 text-xs font-bold outline-none"
                  >
                    <option value="user">مستخدم</option>
                    <option value="moderator">مشرف محتوى</option>
                    <option value="admin">مشرف عام</option>
                  </select>
                </td>
                <td className="py-3">
                  <Chip tone={u.status === "نشط" ? "green" : u.status === "معطّل" ? "amber" : "red"}>{u.status}</Chip>
                </td>
                <td className="py-3 font-black text-[#4568FF]">{u.xp}</td>
                <td className="py-3">
                  <div className="flex gap-1.5">
                    {u.status === "نشط" ? (
                      <button
                        onClick={() => window.confirm(`تعطيل حساب ${u.name}؟ لن يستطيع تسجيل الدخول.`) && updateUser(u.id, { status: "معطّل" }, `تم تعطيل حساب ${u.name}`)}
                        className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100"
                      >
                        <EyeOff className="h-3.5 w-3.5" /> تعطيل
                      </button>
                    ) : u.status === "معطّل" ? (
                      <button
                        onClick={() => updateUser(u.id, { status: "نشط" }, `تم تفعيل حساب ${u.name}`)}
                        className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100"
                      >
                        <Eye className="h-3.5 w-3.5" /> تفعيل
                      </button>
                    ) : null}
                    {u.status !== "محظور" ? (
                      <button
                        onClick={() => window.confirm(`حظر ${u.name} نهائيًا؟ سيتم منعه من المنصة وحذف محتواه من العرض العام.`) && updateUser(u.id, { status: "محظور" }, `تم حظر ${u.name}`)}
                        className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        <X className="h-3.5 w-3.5" /> حظر
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUser(u.id, { status: "نشط" }, `تم فك الحظر عن ${u.name}`)}
                        className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100"
                      >
                        <Check className="h-3.5 w-3.5" /> فك الحظر
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center font-bold text-gray-400">لا توجد نتائج مطابقة للبحث.</p>}
      </div>
      <p className="mt-4 text-xs font-semibold text-gray-400">
        تنبيه: إجراءات التعطيل والحظر هنا تجريبية على بيانات Seed، وتُطبَّق على قاعدة بيانات Supabase عند الربط النهائي.
      </p>
    </div>
  );
}

type ChallengeFormValues = {
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  xp: number;
};

export function AdminChallengesClient({ initialChallenges }: { initialChallenges: ChallengeRow[] }) {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [showForm, setShowForm] = useState(false);
  const { msg, toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof challengeSchema>, unknown, ChallengeFormValues>({ resolver: zodResolver(challengeSchema) });

  const onSubmit = (data: ChallengeFormValues) => {
    const created: ChallengeRow = {
      id: `ch-${Date.now()}`,
      title: data.title,
      description: data.description,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      xp: data.xp,
      status: "مجدول",
    };
    setChallenges((prev) => [created, ...prev]);
    toast("تم إنشاء التحدي ونشره في القائمة");
    reset();
    setShowForm(false);
  };

  const removeChallenge = (id: string, title: string) => {
    if (!window.confirm(`حذف تحدي "${title}"؟`)) return;
    setChallenges((prev) => prev.filter((c) => c.id !== id));
    toast("تم حذف التحدي");
  };

  return (
    <div className="space-y-5">
      <Toast msg={msg} />
      <button
        onClick={() => setShowForm((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-[#4568FF] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 hover:bg-[#3556e0]"
      >
        <Plus className="h-4 w-4" /> إنشاء تحدي جديد
      </button>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black">تحدي جديد</h3>
          <div>
            <input {...register("title")} placeholder="عنوان التحدي" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
            {errors.title && <p className="mt-1 text-xs font-bold text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <textarea {...register("description")} rows={3} placeholder="وصف التحدي وطريقة المشاركة..." className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
            {errors.description && <p className="mt-1 text-xs font-bold text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <select {...register("type")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                <option value="">نوع التحدي</option>
                <option>سؤال اليوم</option>
                <option>موقف تربوي</option>
                <option>تحدي سرعة</option>
                <option>تحدي ثقافة عامة</option>
                <option>تحدي ابتكار</option>
                <option>تحدي أفضل فكرة تدريس</option>
              </select>
              {errors.type && <p className="mt-1 text-xs font-bold text-red-500">{errors.type.message}</p>}
            </div>
            <div>
              <input {...register("startDate")} type="date" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none" />
              {errors.startDate && <p className="mt-1 text-xs font-bold text-red-500">{errors.startDate.message}</p>}
            </div>
            <div>
              <input {...register("endDate")} type="date" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none" />
              {errors.endDate && <p className="mt-1 text-xs font-bold text-red-500">{errors.endDate.message}</p>}
            </div>
            <div>
              <input {...register("xp")} type="number" min={5} max={500} placeholder="النقاط XP" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none" />
              {errors.xp && <p className="mt-1 text-xs font-bold text-red-500">{errors.xp.message}</p>}
            </div>
          </div>
          <button type="submit" className="rounded-full bg-[#7C5CFC] px-6 py-3 text-sm font-black text-white hover:bg-[#6a4de0]">
            نشر التحدي
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {challenges.map((c) => (
          <article key={c.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-black">{c.title}</h3>
              <Chip tone={c.status === "نشط" ? "green" : c.status === "مجدول" ? "blue" : "gray"}>{c.status}</Chip>
            </div>
            <p className="mt-2 text-sm font-semibold leading-7 text-gray-600">{c.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-gray-500">
              <Chip tone="violet">{c.type}</Chip>
              <Chip>{c.startDate} ← {c.endDate}</Chip>
              <Chip tone="amber">{c.xp} نقطة XP</Chip>
            </div>
            <button onClick={() => removeChallenge(c.id, c.title)} className="mt-4 flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100">
              <Trash2 className="h-3.5 w-3.5" /> حذف التحدي
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminScenariosClient({ initialScenarios }: { initialScenarios: ScenarioRow[] }) {
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [category, setCategory] = useState("الكل");
  const [title, setTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ScenarioRow["category"]>("إدارة الفصل");
  const [difficulty, setDifficulty] = useState<"سهل" | "متوسط" | "صعب">("متوسط");
  const { msg, toast } = useToast();

  const categories = ["الكل", ...Array.from(new Set(scenarios.map((s) => s.category)))];
  const filtered = category === "الكل" ? scenarios : scenarios.filter((s) => s.category === category);

  const addScenario = () => {
    if (title.trim().length < 5) {
      toast("عنوان الموقف لازم يكون 5 حروف على الأقل");
      return;
    }
    setScenarios((prev) => [{ id: `s-${Date.now()}`, title: title.trim(), category: newCategory, difficulty, plays: 0, rating: 0 }, ...prev]);
    setTitle("");
    toast("تمت إضافة الموقف الجديد");
  };

  return (
    <div className="space-y-5">
      <Toast msg={msg} />
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-black">إضافة موقف محاكاة جديد</h3>
        <div className="flex flex-col gap-3 md:flex-row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الموقف، مثال: طالب نسى واجبه للمرة الثالثة..." className="flex-1 rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as ScenarioRow["category"])} className="rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
            {["إدارة الفصل", "التعامل مع الطلاب", "التحفيز", "المشكلات السلوكية", "أول يوم تدريس", "التواصل مع أولياء الأمور", "المواقف المفاجئة", "إدارة الوقت"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "سهل" | "متوسط" | "صعب")} className="rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
            <option>سهل</option>
            <option>متوسط</option>
            <option>صعب</option>
          </select>
          <button onClick={addScenario} className="flex items-center justify-center gap-1 rounded-full bg-[#4568FF] px-5 py-3 text-sm font-black text-white hover:bg-[#3556e0]">
            <Plus className="h-4 w-4" /> إضافة
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm ${category === c ? "bg-[#101828] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((s) => (
          <article key={s.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-black leading-7">{s.title}</h3>
              <Chip tone="blue">{s.category}</Chip>
            </div>
            <p className="mt-3 text-xs font-bold text-gray-500">
              الصعوبة: {s.difficulty} • مرات اللعب: {s.plays.toLocaleString("ar-EG")} • التقييم: {s.rating > 0 ? `${s.rating} / 5` : "جديد"}
            </p>
            <button
              onClick={() => window.confirm(`حذف موقف "${s.title}"؟`) && (setScenarios((prev) => prev.filter((x) => x.id !== s.id)), toast("تم حذف الموقف"))}
              className="mt-4 flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" /> حذف الموقف
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminPostsClient({ initialPosts }: { initialPosts: AnonymousPost[] }) {
  const [posts, setPosts] = useState(initialPosts.map((p) => ({ ...p, hidden: false })));
  const [typeFilter, setTypeFilter] = useState("الكل");
  const { msg, toast } = useToast();

  const types = ["الكل", ...Array.from(new Set(initialPosts.map((p) => p.type)))];
  const filtered = typeFilter === "الكل" ? posts : posts.filter((p) => p.type === typeFilter);

  return (
    <div className="space-y-5">
      <Toast msg={msg} />
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm ${typeFilter === t ? "bg-[#101828] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((p) => (
          <article key={p.id} className={`rounded-3xl bg-white p-5 shadow-sm ${p.hidden ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="violet">{p.type}</Chip>
              <span className="text-xs font-bold text-gray-400">{p.authorLabel} • {p.createdAt}</span>
              {p.hidden && <Chip tone="amber">مخفي عن المستخدمين</Chip>}
            </div>
            <p className="mt-3 text-sm font-semibold leading-8 text-gray-700">{p.content}</p>
            <p className="mt-2 text-xs font-bold text-gray-400">
              <Heart className="ml-1 inline h-3.5 w-3.5 text-red-400" /> {p.likes} • <MessageCircle className="ml-1 inline h-3.5 w-3.5 text-[#4568FF]" /> {p.comments.length} تعليقات
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => (setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, hidden: !x.hidden } : x))), toast(p.hidden ? "تم إظهار المنشور للمستخدمين" : "تم إخفاء المنشور عن المستخدمين"))}
                className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100"
              >
                {p.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {p.hidden ? "إظهار" : "إخفاء"}
              </button>
              <button
                onClick={() => window.confirm("حذف هذا المنشور نهائيًا؟") && (setPosts((prev) => prev.filter((x) => x.id !== p.id)), toast("تم حذف المنشور"))}
                className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> حذف
              </button>
            </div>
            <p className="mt-3 border-t border-dashed pt-2 text-[11px] font-semibold text-gray-400">
              ملاحظة إشرافية: الهوية الحقيقية لصاحب المنشور المجهول محفوظة للإدارة فقط ولا تظهر للمستخدمين.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminReportsClient({ initialReports }: { initialReports: ReportRow[] }) {
  const [reports, setReports] = useState(initialReports);
  const [statusFilter, setStatusFilter] = useState("الكل");
  const { msg, toast } = useToast();

  const filtered = statusFilter === "الكل" ? reports : reports.filter((r) => r.status === statusFilter);
  const pending = reports.filter((r) => r.status === "قيد المراجعة").length;

  const act = (id: string, status: ReportRow["status"], note: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast(note);
  };

  return (
    <div className="space-y-5">
      <Toast msg={msg} />
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="red">
          <Flag className="h-3.5 w-3.5" /> {pending} بلاغات بانتظار المراجعة
        </Chip>
        {["الكل", "قيد المراجعة", "تمت المعالجة", "مرفوض"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm ${statusFilter === s ? "bg-[#101828] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((r) => (
          <article key={r.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="red">{r.targetType}</Chip>
              <Chip tone={r.status === "قيد المراجعة" ? "amber" : r.status === "تمت المعالجة" ? "green" : "gray"}>{r.status}</Chip>
              <span className="text-xs font-bold text-gray-400">{r.createdAt} • المُبلِّغ: {r.reporter}</span>
            </div>
            <h3 className="mt-3 font-black">{r.targetTitle}</h3>
            <p className="mt-1 text-sm font-semibold text-gray-600">سبب البلاغ: {r.reason}</p>
            {r.status === "قيد المراجعة" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => act(r.id, "تمت المعالجة", "تمت معالجة البلاغ وحذف المحتوى المخالف")} className="flex items-center gap-1 rounded-full bg-green-600 px-4 py-2 text-xs font-black text-white hover:bg-green-700">
                  <Check className="h-3.5 w-3.5" /> معالجة وحذف المحتوى
                </button>
                <button onClick={() => act(r.id, "تمت المعالجة", "تم حذف التعليق المخالف")} className="flex items-center gap-1 rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-white hover:bg-amber-600">
                  <Trash2 className="h-3.5 w-3.5" /> حذف التعليق المخالف
                </button>
                <button onClick={() => act(r.id, "مرفوض", "تم رفض البلاغ — المحتوى سليم")} className="flex items-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-xs font-black text-gray-700 hover:bg-gray-200">
                  <X className="h-3.5 w-3.5" /> رفض البلاغ
                </button>
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && <p className="rounded-3xl bg-white p-8 text-center font-bold text-gray-400 shadow-sm">لا توجد بلاغات في هذه الحالة.</p>}
      </div>
    </div>
  );
}

export function AdminSettingsClient() {
  const [badges, setBadges] = useState(BADGES);
  const [levels, setLevels] = useState(LEVELS);
  const { msg, toast } = useToast();

  return (
    <div className="space-y-5">
      <Toast msg={msg} />
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <ShieldCheck className="h-5 w-5 text-[#7C5CFC]" /> شارات الإنجاز ونقاطها
        </h2>
        <p className="mt-1 text-sm font-semibold text-gray-500">عدّل نقاط كل شارة، ثم احفظ. التغيير يسري على المستخدمين الجدد فور الحفظ.</p>
        <div className="mt-4 space-y-3">
          {badges.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F5F7FB] px-4 py-3">
              <div>
                <p className="font-black">{b.name}</p>
                <p className="text-xs font-semibold text-gray-500">{b.description}</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold">
                XP
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={b.xp}
                  onChange={(e) => setBadges((prev) => prev.map((x) => (x.id === b.id ? { ...x, xp: Number(e.target.value) || 0 } : x)))}
                  className="w-20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center font-black outline-none focus:border-[#4568FF]"
                />
              </label>
            </div>
          ))}
        </div>
        <button onClick={() => toast("تم حفظ إعدادات الشارات")} className="mt-4 rounded-full bg-[#4568FF] px-6 py-3 text-sm font-black text-white hover:bg-[#3556e0]">
          حفظ الشارات
        </button>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <Trophy className="h-5 w-5 text-amber-500" /> مستويات XP
        </h2>
        <p className="mt-1 text-sm font-semibold text-gray-500">الحد الأدنى من النقاط لكل مستوى.</p>
        <div className="mt-4 space-y-3">
          {levels.map((l, i) => (
            <div key={l.name} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F5F7FB] px-4 py-3">
              <p className="font-black">{i + 1}. {l.name}</p>
              <label className="flex items-center gap-2 text-sm font-bold">
                يبدأ من
                <input
                  type="number"
                  min={0}
                  value={l.minXp}
                  disabled={i === 0}
                  onChange={(e) => setLevels((prev) => prev.map((x, xi) => (xi === i ? { ...x, minXp: Number(e.target.value) || 0 } : x)))}
                  className="w-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center font-black outline-none focus:border-[#4568FF] disabled:opacity-50"
                />
                نقطة
              </label>
            </div>
          ))}
        </div>
        <button onClick={() => toast("تم حفظ مستويات XP")} className="mt-4 rounded-full bg-[#4568FF] px-6 py-3 text-sm font-black text-white hover:bg-[#3556e0]">
          حفظ المستويات
        </button>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <BookOpen className="h-5 w-5 text-[#4568FF]" /> قواعد النقاط الحالية
        </h2>
        <ul className="mt-3 space-y-2">
          {POINTS_RULES.map((r) => (
            <li key={r.action} className="flex items-center justify-between rounded-2xl bg-[#F5F7FB] px-4 py-2.5 text-sm font-bold">
              <span>{r.action}</span>
              <span className="text-[#4568FF]">+{r.xp} XP</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-semibold text-gray-400">
          قواعد النقاط تُحتسب من جهة السيرفر فقط — لا يمكن لأي مستخدم تعديل نقاطه من الواجهة.
        </p>
      </section>
    </div>
  );
}
