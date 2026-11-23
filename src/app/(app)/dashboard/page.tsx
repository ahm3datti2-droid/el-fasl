// EL FASL — dashboard: personal home for the teacher after login.
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Calendar,
  Crown,
  Flame,
  Lightbulb,
  MessageCircle,
  Play,
  RefreshCw,
  Star,
  Trophy,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { BADGES, badgeById, xpProgress } from "@/lib/gamification";
import type { ActivityIcon, ActivityItem } from "@/lib/data";
import DailySituation from "@/components/DailySituation";
import { Badge, Button, Card, ProgressBar } from "@/components/ui";

const QUICK_ACCESS = [
  {
    href: "/simulator",
    title: "محاكي المدرس",
    desc: "مواقف واقعية وقرارات تغيّر النتيجة",
    icon: Brain,
    color: "bg-blue-100 text-electric dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    href: "/flip-class",
    title: "اقلب الحصة",
    desc: "فكرة تدريس مبتكرة بضغطة واحدة",
    icon: RefreshCw,
    color: "bg-violet-100 text-accent dark:bg-violet-900/40 dark:text-violet-300",
  },
  {
    href: "/classroom-tools",
    title: "مولد الحصة",
    desc: "عجلة أسماء، مؤقت، ونقاط الفرق",
    icon: Wrench,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    href: "/league",
    title: "دوري المدرسين",
    desc: "تحديات ونقاط وترتيب أسبوعي",
    icon: Trophy,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  {
    href: "/ideas",
    title: "مصنع الأفكار",
    desc: "أفكار عملية من مدرسين زيك",
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    href: "/teacher-unfiltered",
    title: "فضفضة مدرس",
    desc: "شارك موقفك — باختيارك بدون اسم",
    icon: MessageCircle,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
  },
];

const ACTIVITY_ICONS: Record<ActivityIcon, typeof Lightbulb> = {
  idea: Lightbulb,
  challenge: Zap,
  help: Users,
  badge: Star,
  comment: MessageCircle,
};

const ACTIVITY_FEED: ActivityItem[] = [
  { id: "a1", name: "أ. منى", action: "شاركت فكرة «الدرس في دقيقة واحدة»", time: "منذ 20 دقيقة", icon: "idea" },
  { id: "a2", name: "أ. كريم", action: "أكمل تحدي اليوم وحصل على 30 نقطة", time: "منذ ساعة", icon: "challenge" },
  { id: "a3", name: "أ. سارة", action: "ساعدت مدرسًا في شرح درس الكسور", time: "منذ ساعتين", icon: "help" },
  { id: "a4", name: "أ. عمر", action: "حصل على شارة «مبتكر الأسبوع»", time: "منذ 3 ساعات", icon: "badge" },
  { id: "a5", name: "أ. هدى", action: "علّقت على فكرة «حوّل الدرس لقصة»", time: "منذ 5 ساعات", icon: "comment" },
];

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const firstName = user.name.split(" ")[0] || "يا مدرس";
  const progress = xpProgress(user.xp);
  const today = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  // Demo profile: 120 XP, 3-day streak, 2 badges. Real profiles grow from their
  // own points_transactions / user_badges rows (Phase 4 wires them live).
  const streakDays = user.demo ? 3 : 0;
  const challengesCompleted = user.demo ? 6 : 0;
  const earnedIds = user.demo ? ["first-challenge", "first-idea"] : [];
  const earnedBadges = earnedIds
    .map((id) => badgeById(id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <section>
        <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Calendar className="size-4" /> {today}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy md:text-3xl dark:text-white">
          أهلاً يا {firstName} 👋
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          جاهز تخلي حصتك النهارده مختلفة؟
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Daily challenge */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-l from-navy via-electric to-accent p-6 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="accent" className="bg-white/15 text-white">
                    <Flame className="size-3.5" /> تحدي اليوم
                  </Badge>
                  <h2 className="mt-3 text-2xl font-extrabold">اشرح بدون كلام!</h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85">
                    اشرح فكرة من درسك النهارده باستخدام الإيماءات والرسم على السبورة فقط —
                    من غير ولا كلمة — لمدة 3 دقائق، وشوف الطلاب هيفهموا ولا لأ.
                  </p>
                </div>
                <span className="hidden rounded-2xl bg-white/15 px-3 py-2 text-center text-xs font-bold sm:block">
                  <Zap className="mx-auto size-5" />
                  +30 XP
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/challenges">
                  <Button
                    variant="secondary"
                    className="border-white/30 bg-white text-navy hover:bg-white/90 dark:bg-white dark:hover:bg-white/90"
                  >
                    <Play className="size-4" /> ابدأ التحدي
                  </Button>
                </Link>
                <Link href="/challenges">
                  <span className="inline-flex h-11 items-center px-3 text-sm font-semibold text-white/90 hover:text-white">
                    شوف تحديات الأسبوع
                  </span>
                </Link>
              </div>
            </div>
          </Card>

          {/* Daily situation */}
          <Card className="p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-navy dark:text-white">
                موقف اليوم التربوي
              </h2>
              <Badge variant="info">إدارة الفصل</Badge>
            </div>
            <div className="mt-4">
              <DailySituation />
            </div>
          </Card>

          {/* Quick access */}
          <section>
            <h2 className="mb-3 text-lg font-extrabold text-navy dark:text-white">
              وصول سريع
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {QUICK_ACCESS.map(({ href, title, desc, icon: Icon, color }) => (
                <Link key={href} href={href} className="group">
                  <Card className="flex h-full items-start gap-3 p-4 transition-all group-hover:-translate-y-0.5 group-hover:border-electric/40 group-hover:shadow-md">
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-navy dark:text-white">{title}</span>
                      <span className="mt-0.5 block text-sm text-slate-600 dark:text-slate-300">
                        {desc}
                      </span>
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Activity feed */}
          <Card className="p-6">
            <h2 className="text-lg font-extrabold text-navy dark:text-white">
              آخر تفاعلات المجتمع
            </h2>
            <ul className="mt-4 space-y-4">
              {ACTIVITY_FEED.map((item) => {
                const Icon = ACTIVITY_ICONS[item.icon];
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-electric dark:bg-navy">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        <strong className="text-navy dark:text-white">{item.name}</strong>{" "}
                        {item.action}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{item.time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Progress */}
        <aside className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-accent text-white">
                <Crown className="size-6" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500">مستواك الحالي</p>
                <p className="text-lg font-extrabold text-navy dark:text-white">
                  {progress.current.name}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-navy dark:text-white">{user.xp} نقطة</span>
                <span className="text-slate-500">
                  {progress.next
                    ? `${progress.next.minXp} للمستوى التالي`
                    : "وصلت لأعلى مستوى"}
                </span>
              </div>
              <ProgressBar value={progress.progress} className="mt-2" />
              {progress.next && (
                <p className="mt-2 text-xs text-slate-500">
                  باقي {progress.xpNeeded} نقطة عشان تبقى «{progress.next.name}».
                </p>
              )}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-soft p-3 dark:bg-navy">
                <p className="text-lg font-extrabold text-navy dark:text-white">
                  {challengesCompleted}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">تحدي مكتمل</p>
              </div>
              <div className="rounded-xl bg-soft p-3 dark:bg-navy">
                <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-navy dark:text-white">
                  <Flame className="size-4 text-amber-500" /> {streakDays}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">يوم متتالي</p>
              </div>
              <div className="rounded-xl bg-soft p-3 dark:bg-navy">
                <p className="text-lg font-extrabold text-navy dark:text-white">
                  {earnedBadges.length}/{BADGES.length}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">شارة</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-extrabold text-navy dark:text-white">شاراتك</h3>
            {earnedBadges.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {earnedBadges.map((badge) => (
                  <li key={badge.id} className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                      <Star className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-navy dark:text-white">{badge.name}</p>
                      <p className="text-xs text-slate-500">{badge.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                لسه مفيش شارات — أكمل أول تحدي عشان تفتح شارة «أول تحدي».
              </p>
            )}
            <Link href="/league" className="mt-4 inline-block text-sm font-bold text-electric hover:underline">
              شوف كل الشارات والدوري
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
