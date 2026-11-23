// EL FASL — Admin Dashboard (server-guarded: admin only)
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChartColumn,
  Flag,
  Lightbulb,
  MessageCircle,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { getServerRole } from "@/lib/community-auth";
import { AdminShell, StatCard } from "@/lib/community-ui";
import { ADMIN_STATS, SEED_CHALLENGES, SEED_REPORTS } from "@/lib/community-data";

const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default async function AdminPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");

  const maxSignups = Math.max(...ADMIN_STATS.weeklySignups);

  return (
    <AdminShell title="لوحة الإدارة" subtitle="نظرة عامة على المنصة — المستخدمون، المحتوى، البلاغات، والتحديات.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="إجمالي المستخدمين" value={ADMIN_STATS.totalUsers.toLocaleString("ar-EG")} hint={`+${ADMIN_STATS.newUsersThisWeek} هذا الأسبوع`} icon={<Users className="h-5 w-5" />} color="bg-[#4568FF]" />
        <StatCard label="نشط اليوم" value={ADMIN_STATS.activeToday.toLocaleString("ar-EG")} hint="مستخدم سجّل دخول اليوم" icon={<Zap className="h-5 w-5" />} color="bg-green-500" />
        <StatCard label="الأفكار المنشورة" value={ADMIN_STATS.totalIdeas.toLocaleString("ar-EG")} hint="في مصنع الأفكار" icon={<Lightbulb className="h-5 w-5" />} color="bg-amber-500" />
        <StatCard label="منشورات فضفضة" value={ADMIN_STATS.totalPosts.toLocaleString("ar-EG")} hint="مواقف وتجارب" icon={<MessageCircle className="h-5 w-5" />} color="bg-[#7C5CFC]" />
        <StatCard label="بلاغات بانتظار المراجعة" value={ADMIN_STATS.pendingReports.toLocaleString("ar-EG")} hint="راجعها من صفحة البلاغات" icon={<Flag className="h-5 w-5" />} color="bg-red-500" />
        <StatCard label="تحديات نشطة" value={ADMIN_STATS.activeChallenges.toLocaleString("ar-EG")} hint="تحدي اليوم + تحدي الأسبوع" icon={<Trophy className="h-5 w-5" />} color="bg-[#101828]" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* تحليلات: تسجيلات الأسبوع */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-black">
            <ChartColumn className="h-5 w-5 text-[#4568FF]" /> تسجيلات جديدة هذا الأسبوع
          </h2>
          <div className="mt-5 flex items-end gap-2" style={{ height: 140 }}>
            {ADMIN_STATS.weeklySignups.map((n, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-black text-[#4568FF]">{n}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#4568FF] to-[#7C5CFC]"
                  style={{ height: `${Math.max(8, (n / maxSignups) * 100)}px` }}
                />
                <span className="text-[10px] font-bold text-gray-400">{DAYS[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-gray-500">
            إجمالي نقاط XP الممنوحة هذا الأسبوع: {ADMIN_STATS.xpGivenThisWeek.toLocaleString("ar-EG")} نقطة
          </p>
        </section>

        {/* أكثر المواد نشاطًا */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-black">أكثر المواد نشاطًا (أفكار منشورة)</h2>
          <div className="mt-4 space-y-3">
            {ADMIN_STATS.topSubjects.map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm font-bold">
                  <span>{s.subject}</span>
                  <span className="text-[#4568FF]">{s.count} فكرة</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#F5F7FB]">
                  <div className="h-full rounded-full bg-[#4568FF]" style={{ width: `${(s.count / 132) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t pt-4">
            <h3 className="font-black">أحدث البلاغات</h3>
            <ul className="mt-2 space-y-2 text-sm font-semibold text-gray-600">
              {SEED_REPORTS.filter((r) => r.status === "قيد المراجعة").map((r) => (
                <li key={r.id} className="flex items-start gap-2">
                  <Flag className="mt-1 h-4 w-4 shrink-0 text-red-500" />
                  {r.targetTitle} — {r.reason}
                </li>
              ))}
            </ul>
            <Link href="/admin/reports" className="mt-3 inline-block rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-100">
              مراجعة البلاغات ←
            </Link>
          </div>
        </section>
      </div>

      {/* التحديات الحالية */}
      <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-black">التحديات الحالية</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {SEED_CHALLENGES.filter((c) => c.status !== "منتهي").map((c) => (
            <div key={c.id} className="rounded-2xl bg-[#F5F7FB] p-4">
              <p className="font-black">{c.title}</p>
              <p className="mt-1 text-sm font-semibold text-gray-500">{c.type} • {c.xp} نقطة XP • {c.status}</p>
            </div>
          ))}
        </div>
        <Link href="/admin/challenges" className="mt-4 inline-block rounded-full bg-[#4568FF] px-5 py-2.5 text-sm font-black text-white hover:bg-[#3556e0]">
          إدارة التحديات ←
        </Link>
      </section>
    </AdminShell>
  );
}
