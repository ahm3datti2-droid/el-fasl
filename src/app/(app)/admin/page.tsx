// EL FASL — Admin Dashboard (server-guarded: admin only)
// Stats come from live Supabase when configured; seed constants are only the
// fallback for demo mode (no Supabase) or a failed query — never mixed in
// silently: `real` decides which set renders.
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
import { getServerRole, isDemoSession } from "@/lib/community-auth";
import { AdminShell, StatCard } from "@/lib/community-ui";
import { ADMIN_STATS, SEED_CHALLENGES, SEED_REPORTS } from "@/lib/community-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";

const AR_WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const TARGET_LABELS: Record<string, string> = {
  idea: "فكرة",
  anonymous_post: "منشور فضفضة",
  comment: "تعليق",
  help_request: "طلب مساعدة",
};

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  daily: "تحدي اليوم",
  question: "سؤال",
  situation: "موقف",
  speed: "سرعة",
  general: "عام",
  innovation: "ابتكار",
};

type LiveStats = {
  totalUsers: number;
  activeToday: number;
  totalIdeas: number;
  totalPosts: number;
  pendingReports: number;
  activeChallenges: number;
  xpGivenThisWeek: number;
  newUsersThisWeek: number;
  topSubjects: { subject: string; count: number }[];
  weeklySignups: number[];
  weekLabels: string[];
};

async function loadLiveStats(): Promise<LiveStats | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenAgoISO = sevenDaysAgo.toISOString();
  const todayISO = todayStart.toISOString();

  const [users, ideas, posts, reports, challenges, signups, points, subjects] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("ideas").select("id", { count: "exact", head: true }),
      supabase
        .from("anonymous_posts")
        .select("id", { count: "exact", head: true })
        .eq("is_hidden", false),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("challenges")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("profiles").select("created_at").gte("created_at", sevenAgoISO),
      supabase
        .from("points_transactions")
        .select("user_id, amount, created_at")
        .gte("created_at", sevenAgoISO)
        .limit(5000),
      supabase.from("ideas").select("subject").limit(1000),
    ]);

  for (const r of [users, ideas, posts, reports, challenges, signups, points, subjects]) {
    if (r.error) throw new Error(r.error.message);
  }

  // Weekly signups bucketed per day (last 7 days, oldest first).
  const weeklySignups = Array<number>(7).fill(0);
  const weekLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    weekLabels.push(AR_WEEKDAYS[d.getDay()]);
  }
  for (const row of signups.data ?? []) {
    const idx = Math.floor(
      (new Date(row.created_at).getTime() - sevenDaysAgo.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (idx >= 0 && idx < 7) weeklySignups[idx] += 1;
  }

  const activeToday = new Set(
    (points.data ?? [])
      .filter((p) => new Date(p.created_at) >= todayStart)
      .map((p) => p.user_id),
  ).size;
  const xpGivenThisWeek = (points.data ?? []).reduce(
    (sum, p) => sum + Math.max(0, p.amount ?? 0),
    0,
  );

  const subjectCounts = new Map<string, number>();
  for (const row of subjects.data ?? []) {
    const s = (row.subject ?? "عام").trim() || "عام";
    subjectCounts.set(s, (subjectCounts.get(s) ?? 0) + 1);
  }
  const topSubjects = [...subjectCounts.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    totalUsers: users.count ?? 0,
    activeToday,
    totalIdeas: ideas.count ?? 0,
    totalPosts: posts.count ?? 0,
    pendingReports: reports.count ?? 0,
    activeChallenges: challenges.count ?? 0,
    xpGivenThisWeek,
    newUsersThisWeek: (signups.data ?? []).length,
    topSubjects,
    weeklySignups,
    weekLabels,
  };
}

export default async function AdminPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");
  const demo = await isDemoSession();

  let stats: LiveStats = {
    totalUsers: ADMIN_STATS.totalUsers,
    activeToday: ADMIN_STATS.activeToday,
    totalIdeas: ADMIN_STATS.totalIdeas,
    totalPosts: ADMIN_STATS.totalPosts,
    pendingReports: ADMIN_STATS.pendingReports,
    activeChallenges: ADMIN_STATS.activeChallenges,
    xpGivenThisWeek: ADMIN_STATS.xpGivenThisWeek,
    newUsersThisWeek: ADMIN_STATS.newUsersThisWeek,
    topSubjects: ADMIN_STATS.topSubjects,
    weeklySignups: ADMIN_STATS.weeklySignups,
    weekLabels: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
  };
  let real = false;
  let liveReports: { id: string; target_type: string; reason: string }[] | null = null;
  let liveChallenges: { id: string; title: string; type: string; xp_reward: number; ends_at: string | null }[] | null = null;

  try {
    const live = await loadLiveStats();
    if (live) {
      stats = live;
      real = true;
      const supabase = await createClient();
      if (supabase) {
        const [rep, chal] = await Promise.all([
          supabase
            .from("reports")
            .select("id, target_type, reason")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("challenges")
            .select("id, title, type, xp_reward, ends_at")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(4),
        ]);
        if (!rep.error) liveReports = rep.data ?? [];
        if (!chal.error) liveChallenges = chal.data ?? [];
      }
    }
  } catch {
    // Any live-query failure falls back to the seed constants above.
    real = false;
    liveReports = null;
    liveChallenges = null;
  }

  const maxSignups = Math.max(1, ...stats.weeklySignups);
  const maxSubject = Math.max(1, ...stats.topSubjects.map((s) => s.count));
  const seedReports = SEED_REPORTS.filter((r) => r.status === "قيد المراجعة");
  const seedChallenges = SEED_CHALLENGES.filter((c) => c.status !== "منتهي");

  return (
    <AdminShell title="لوحة الإدارة" subtitle="نظرة عامة على المنصة — المستخدمون، المحتوى، البلاغات، والتحديات." demo={demo}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="إجمالي المستخدمين" value={stats.totalUsers.toLocaleString("ar-EG")} hint={`+${stats.newUsersThisWeek} هذا الأسبوع`} icon={<Users className="h-5 w-5" />} color="bg-[#4568FF]" />
        <StatCard label="نشط اليوم" value={stats.activeToday.toLocaleString("ar-EG")} hint={real ? "حصلوا على نقاط اليوم" : "مستخدم سجّل دخول اليوم"} icon={<Zap className="h-5 w-5" />} color="bg-green-500" />
        <StatCard label="الأفكار المنشورة" value={stats.totalIdeas.toLocaleString("ar-EG")} hint="في مصنع الأفكار" icon={<Lightbulb className="h-5 w-5" />} color="bg-amber-500" />
        <StatCard label="منشورات فضفضة" value={stats.totalPosts.toLocaleString("ar-EG")} hint="مواقف وتجارب" icon={<MessageCircle className="h-5 w-5" />} color="bg-[#7C5CFC]" />
        <StatCard label="بلاغات بانتظار المراجعة" value={stats.pendingReports.toLocaleString("ar-EG")} hint="راجعها من صفحة البلاغات" icon={<Flag className="h-5 w-5" />} color="bg-red-500" />
        <StatCard label="تحديات نشطة" value={stats.activeChallenges.toLocaleString("ar-EG")} hint="تحدي اليوم + تحدي الأسبوع" icon={<Trophy className="h-5 w-5" />} color="bg-[#101828]" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {/* تحليلات: تسجيلات الأسبوع */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-black">
            <ChartColumn className="h-5 w-5 text-[#4568FF]" /> تسجيلات جديدة هذا الأسبوع
          </h2>
          <div className="mt-5 flex items-end gap-2" style={{ height: 140 }}>
            {stats.weeklySignups.map((n, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-black text-[#4568FF]">{n}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#4568FF] to-[#7C5CFC]"
                  style={{ height: `${Math.max(8, (n / maxSignups) * 100)}px` }}
                />
                <span className="text-[10px] font-bold text-gray-400">{stats.weekLabels[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-bold text-gray-500">
            إجمالي نقاط XP الممنوحة هذا الأسبوع: {stats.xpGivenThisWeek.toLocaleString("ar-EG")} نقطة
          </p>
        </section>

        {/* أكثر المواد نشاطًا */}
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-black">أكثر المواد نشاطًا (أفكار منشورة)</h2>
          <div className="mt-4 space-y-3">
            {stats.topSubjects.length === 0 ? (
              <p className="text-sm font-semibold text-gray-400">لا توجد أفكار منشورة بعد.</p>
            ) : (
              stats.topSubjects.map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between text-sm font-bold">
                    <span>{s.subject}</span>
                    <span className="text-[#4568FF]">{s.count} فكرة</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#F5F7FB]">
                    <div className="h-full rounded-full bg-[#4568FF]" style={{ width: `${(s.count / maxSubject) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-5 border-t pt-4">
            <h3 className="font-black">أحدث البلاغات</h3>
            {real ? (
              liveReports && liveReports.length > 0 ? (
                <ul className="mt-2 space-y-2 text-sm font-semibold text-gray-600">
                  {liveReports.map((r) => (
                    <li key={r.id} className="flex items-start gap-2">
                      <Flag className="mt-1 h-4 w-4 shrink-0 text-red-500" />
                      {TARGET_LABELS[r.target_type] ?? r.target_type} — {r.reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm font-semibold text-gray-400">لا توجد بلاغات قيد المراجعة.</p>
              )
            ) : (
              <ul className="mt-2 space-y-2 text-sm font-semibold text-gray-600">
                {seedReports.map((r) => (
                  <li key={r.id} className="flex items-start gap-2">
                    <Flag className="mt-1 h-4 w-4 shrink-0 text-red-500" />
                    {r.targetTitle} — {r.reason}
                  </li>
                ))}
              </ul>
            )}
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
          {real ? (
            liveChallenges && liveChallenges.length > 0 ? (
              liveChallenges.map((c) => (
                <div key={c.id} className="rounded-2xl bg-[#F5F7FB] p-4">
                  <p className="font-black">{c.title}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    {CHALLENGE_TYPE_LABELS[c.type] ?? c.type} • {c.xp_reward} نقطة XP •{" "}
                    {c.ends_at && new Date(c.ends_at) < new Date() ? "منتهي" : "نشط"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm font-semibold text-gray-400">لا توجد تحديات نشطة حاليًا.</p>
            )
          ) : (
            seedChallenges.map((c) => (
              <div key={c.id} className="rounded-2xl bg-[#F5F7FB] p-4">
                <p className="font-black">{c.title}</p>
                <p className="mt-1 text-sm font-semibold text-gray-500">{c.type} • {c.xp} نقطة XP • {c.status}</p>
              </div>
            ))
          )}
        </div>
        <Link href="/admin/challenges" className="mt-4 inline-block rounded-full bg-[#4568FF] px-5 py-2.5 text-sm font-black text-white hover:bg-[#3556e0]">
          إدارة التحديات ←
        </Link>
      </section>
    </AdminShell>
  );
}
