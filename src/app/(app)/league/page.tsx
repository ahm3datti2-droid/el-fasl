"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Crown,
  Drama,
  Flag,
  Flame,
  HeartHandshake,
  HelpCircle,
  Lightbulb,
  Medal,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import {
  BADGES,
  LEADERBOARD,
  LEAGUE_CHALLENGE_TYPES,
  LEVELS,
  levelForXp,
  type Badge,
} from "@/lib/features-data";

const FONT = { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" } as const;

const BADGE_ICONS: Record<string, typeof Flag> = {
  Flag,
  Lightbulb,
  HeartHandshake,
  Sparkles,
  Flame,
  ShieldCheck,
  Brain,
  Zap,
};

const TYPE_ICONS: Record<string, typeof HelpCircle> = {
  HelpCircle,
  Drama,
  Timer,
  BookOpen,
  Lightbulb,
  Trophy,
};

const RANK_STYLE = [
  "bg-amber-400 text-white",
  "bg-slate-300 text-white",
  "bg-amber-700 text-white",
];

export default function LeaguePage() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [myXp, setMyXp] = useState(120);
  const [myStreak, setMyStreak] = useState(3);

  useEffect(() => {
    try {
      const x = localStorage.getItem("elfasl-xp");
      if (x) setMyXp(Number(x) || 120);
      const s = localStorage.getItem("elfasl-streak");
      if (s) setMyStreak(Number(s) || 3);
    } catch {
      /* ignore */
    }
  }, []);

  const myLevel = levelForXp(myXp);
  const nextLevel = LEVELS.find((l) => l.minXp > myXp) ?? null;
  const progressToNext = nextLevel
    ? Math.min(100, Math.round(((myXp - myLevel.minXp) / (nextLevel.minXp - myLevel.minXp)) * 100))
    : 100;

  const ranked = useMemo(() => {
    const sorted = [...LEADERBOARD].sort((a, b) =>
      period === "weekly" ? b.weeklyXp - a.weeklyXp : b.monthlyXp - a.monthlyXp
    );
    return sorted;
  }, [period]);

  const myRank = ranked.findIndex((t) => t.xp <= myXp) + 1;

  const earnedBadges: Badge[] = BADGES.filter((b) => myXp >= b.xpRequired);

  return (
    <div dir="rtl" style={FONT} className="min-h-screen bg-[#F5F7FB] pb-24 text-[#101828]">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            <Trophy className="h-6 w-6 text-amber-500" /> دوري المدرسين
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            اجمع النقاط، اطلع في المستويات، ونافس أفضل المدرسين في المنصة.
          </p>
        </header>

        {/* My status */}
        <section className="mt-5 overflow-hidden rounded-3xl bg-[#101828] p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white/60">مستواك الحالي</p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-extrabold">
                <Crown className="h-5 w-5 text-amber-300" /> {myLevel.name}
              </h2>
              <p className="mt-1 text-sm text-white/70">{myLevel.description}</p>
            </div>
            <div className="shrink-0 text-left">
              <p className="text-3xl font-extrabold">{myXp}</p>
              <p className="text-xs text-white/60">نقطة خبرة</p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">
                <Flame className="h-3.5 w-3.5 text-orange-400" /> {myStreak} أيام متتالية
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold text-white/70">
              <span>{nextLevel ? `للمستوى التالي: ${nextLevel.name}` : "وصلت لأعلى مستوى — أسطورة!"}</span>
              <span>{nextLevel ? `${myXp} / ${nextLevel.minXp}` : `${myXp} نقطة`}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[#4568FF] to-[#7C5CFC] transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
          {myRank > 0 && (
            <p className="mt-3 text-xs text-white/60">
              ترتيبك التقريبي في الدوري {period === "weekly" ? "الأسبوعي" : "الشهري"}: #{myRank} من {ranked.length + 1} — كمّل تحديات عشان تطلع فوق.
            </p>
          )}
        </section>

        {/* Levels ladder */}
        <section className="mt-6">
          <h2 className="text-lg font-extrabold">مستويات الدوري</h2>
          <div className="mt-3 space-y-2">
            {LEVELS.map((level) => {
              const reached = myXp >= level.minXp;
              const isCurrent = level.id === myLevel.id;
              return (
                <div
                  key={level.id}
                  className={`flex items-center gap-3 rounded-2xl p-4 shadow-sm transition ${
                    isCurrent ? "bg-[#101828] text-white ring-2 ring-[#4568FF]" : "bg-white"
                  }`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white"
                    style={{ backgroundColor: reached || isCurrent ? level.color : "#CBD5E1" }}
                  >
                    {isCurrent ? <Crown className="h-5 w-5" /> : <Medal className="h-5 w-5" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-extrabold">
                      {level.name}
                      {isCurrent && <span className="mr-2 rounded-full bg-[#4568FF] px-2 py-0.5 text-[11px] font-bold text-white">مستواك</span>}
                    </p>
                    <p className={`text-xs leading-relaxed ${isCurrent ? "text-white/70" : "text-slate-500"}`}>{level.description}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-extrabold ${isCurrent ? "text-white/80" : "text-slate-400"}`}>
                    {level.maxXp === null ? `${level.minXp}+` : `${level.minXp} - ${level.maxXp}`} نقطة
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <Trophy className="h-5 w-5 text-amber-500" /> لوحة الصدارة
            </h2>
            <div className="flex rounded-full bg-white p-1 shadow-sm">
              <button
                onClick={() => setPeriod("weekly")}
                className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                  period === "weekly" ? "bg-[#101828] text-white" : "text-slate-500"
                }`}
              >
                هذا الأسبوع
              </button>
              <button
                onClick={() => setPeriod("monthly")}
                className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                  period === "monthly" ? "bg-[#101828] text-white" : "text-slate-500"
                }`}
              >
                هذا الشهر
              </button>
            </div>
          </div>

          {/* Top 3 */}
          <div className="mt-4 grid grid-cols-3 items-end gap-2">
            {ranked.slice(0, 3).map((t, i) => {
              const order = [1, 0, 2][i]; // visual order: 2nd, 1st, 3rd
              const entry = ranked[order];
              const rank = order + 1;
              const xp = period === "weekly" ? entry.weeklyXp : entry.monthlyXp;
              return (
                <div
                  key={entry.id}
                  className={`rounded-2xl bg-white p-3 text-center shadow-sm ${rank === 1 ? "pb-5 ring-2 ring-amber-300" : ""}`}
                >
                  <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${RANK_STYLE[rank - 1]}`}>
                    {rank}
                  </span>
                  <div
                    className="mx-auto mt-2 flex h-11 w-11 items-center justify-center rounded-full text-base font-extrabold text-white"
                    style={{ backgroundColor: rank === 1 ? "#4568FF" : rank === 2 ? "#7C5CFC" : "#101828" }}
                  >
                    {entry.name.replace("أ. ", "").charAt(0)}
                  </div>
                  <p className="mt-2 text-xs font-extrabold leading-snug">{entry.name}</p>
                  <p className="text-[11px] text-slate-400">{entry.subject}</p>
                  <p className="mt-1 text-sm font-extrabold text-[#4568FF]">{xp} نقطة</p>
                </div>
              );
            })}
          </div>

          {/* Full list */}
          <div className="mt-3 space-y-2">
            {ranked.map((t, i) => {
              const xp = period === "weekly" ? t.weeklyXp : t.monthlyXp;
              const level = levelForXp(t.xp);
              return (
                <article key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                      i < 3 ? `${RANK_STYLE[i]} ` : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{ backgroundColor: level.color }}
                  >
                    {t.name.replace("أ. ", "").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{t.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {t.subject} • {t.governorate} • {level.name} • {t.ideasCount} فكرة • ساعد {t.helpsCount} مدرسين
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="text-sm font-extrabold text-[#4568FF]">{xp} نقطة</p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Flame className="h-3 w-3 text-orange-400" /> {t.streak} أيام
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Badges */}
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Medal className="h-5 w-5 text-[#7C5CFC]" /> الشارات ({earnedBadges.length} / {BADGES.length})
          </h2>
          <p className="mt-1 text-sm text-slate-500">الشارات بتتفتح تلقائيًا لما توصل للنقاط المطلوبة.</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BADGES.map((b) => {
              const earned = myXp >= b.xpRequired;
              const Icon = BADGE_ICONS[b.icon] ?? Flag;
              return (
                <div
                  key={b.id}
                  className={`rounded-2xl p-4 text-center shadow-sm transition ${
                    earned ? "bg-white ring-2 ring-amber-300" : "bg-white opacity-60"
                  }`}
                >
                  <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${earned ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-2 text-sm font-extrabold leading-snug">{b.name}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{b.description}</p>
                  <p className="mt-2 text-[11px] font-bold text-[#7C5CFC]">
                    {earned ? "تم الحصول عليها" : `تحتاج ${b.xpRequired} نقطة`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Challenge types */}
        <section className="mt-6">
          <h2 className="text-lg font-extrabold">أنواع تحديات الدوري</h2>
          <p className="mt-1 text-sm text-slate-500">كل نوع تحدي بيكسبك نقاط مختلفة — نوّع مشاركاتك عشان تطلع أسرع.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {LEAGUE_CHALLENGE_TYPES.map((c) => {
              const Icon = TYPE_ICONS[c.icon] ?? HelpCircle;
              return (
                <article key={c.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4568FF]/10 text-[#4568FF]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold">{c.name}</h3>
                      <span className="rounded-full bg-[#7C5CFC]/10 px-2 py-0.5 text-[11px] font-bold text-[#7C5CFC]">+{c.xp} نقطة</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{c.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="font-extrabold">إزاي تكسب نقاط؟</h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-600">
              <li>• المشاركة في تحدي يومي: <b>20 نقطة</b></li>
              <li>• إجابة صحيحة على سؤال اليوم: <b>15 نقطة</b></li>
              <li>• إكمال سيناريو في محاكي المدرس: <b>30 نقطة</b></li>
              <li>• مشاركة فكرة في مصنع الأفكار: <b>25 نقطة</b></li>
              <li>• مساعدة مدرس في شبكة المساعدة: <b>20 نقطة</b></li>
              <li>• الحفاظ على سلسلة الأيام المتتالية: <b>نقاط إضافية كل 7 أيام</b></li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              النقاط بتتحسب من السيرفر بس — مفيش طريقة لتعديلها من الواجهة، وكل عملية ليها حد أقصى.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
