// EL FASL — public landing page ONLY. No inner-platform content is shown here;
// every protected route requires a session (see src/proxy.ts + (app)/layout.tsx).
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Crown,
  Flame,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  Play,
  RefreshCw,
  Sparkles,
  Trophy,
  Wrench,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge, Button, Card } from "@/components/ui";

const FEATURES = [
  {
    icon: Brain,
    title: "محاكي المدرس",
    desc: "مواقف واقعية من الفصل، قراراتك تغيّر السيناريو، وتحليل تربوي لكل اختيار.",
    href: "/simulator",
    color: "bg-blue-100 text-electric dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    icon: RefreshCw,
    title: "اقلب الحصة",
    desc: "بضغطة واحدة تولّد فكرة تدريس مبتكرة: اشرح كأنك مذيع أخبار، أو حوّل الدرس لمسابقة.",
    href: "/flip-class",
    color: "bg-violet-100 text-accent dark:bg-violet-900/40 dark:text-violet-300",
  },
  {
    icon: Wrench,
    title: "مولد الحصة",
    desc: "اختيار طالب عشوائي، عجلة أسماء، مؤقت، لوحة نقاط للفرق — أدوات جاهزة على الشاشة.",
    href: "/classroom-tools",
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    icon: Lightbulb,
    title: "مصنع الأفكار",
    desc: "أفكار تدريس صغيرة وعملية من مدرسين زيك، بإعجاب وحفظ وتعليقات.",
    href: "/ideas",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    icon: MessageCircle,
    title: "فضفضة مدرس",
    desc: "مساحة آمنة تشارك فيها موقف مضحك أو صعب — باختيارك، بدون اسم.",
    href: "/teacher-unfiltered",
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
  },
  {
    icon: Trophy,
    title: "دوري المدرسين",
    desc: "تحديات يومية ونقاط وشارات وترتيب أسبوعي — من مدرس جديد لأسطورة التدريس.",
    href: "/league",
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
];

const STEPS = [
  { n: "1", title: "أنشئ حسابك", desc: "سجّل بتخصصك ومرحلتك ومادتك في أقل من دقيقة." },
  { n: "2", title: "ابدأ تحدي اليوم", desc: "موقف جديد كل يوم، جرّبه قبل حصتك الصبح." },
  { n: "3", title: "اجمع النقاط وارتقِ", desc: "كل مشاركة ترفع مستواك وتفتح شارات جديدة." },
];

export default function LandingPage() {
  const demoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={null} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="pointer-events-none absolute -top-24 start-1/4 size-72 rounded-full bg-electric/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 end-1/4 size-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 text-center md:py-24">
          <Badge variant="accent" className="bg-white/10 text-white">
            <Sparkles className="size-3.5" /> منصة تفاعلية لمجتمع المدرسين
          </Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
            الفصل
            <span className="mt-2 block bg-gradient-to-l from-electric to-accent bg-clip-text text-2xl text-transparent md:text-4xl">
              مش مجرد شرح.. تجربة مختلفة كل يوم.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            تحديات يومية، مواقف تربوية واقعية، ألعاب صفية، وخبرات مدرسين زيك — كل يوم فكرة
            جديدة تخلي حصتك مختلفة.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg">
                ابدأ مجانًا <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <Play className="size-5" /> تسجيل الدخول
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Flame className="size-4 text-amber-400" /> تحدي جديد كل يوم
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="size-4 text-blue-400" /> مواقف تفاعلية واقعية
            </span>
            <span className="flex items-center gap-1.5">
              <Crown className="size-4 text-violet-400" /> 5 مستويات وشارات
            </span>
          </div>
          {demoMode && (
            <p className="mx-auto mt-6 max-w-xl rounded-xl bg-amber-400/15 px-4 py-2.5 text-sm font-medium text-amber-200">
              الوضع التجريبي مفعّل — سجّل بأي بريد وكلمة مرور (6 أحرف فأكثر) لتجربة المنصة
              كاملة، أو ادخل بحساب <span dir="ltr">admin@elfasl.app</span> لعرض لوحة الإدارة.
            </p>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
        <h2 className="text-center text-2xl font-extrabold text-navy md:text-3xl dark:text-white">
          كل اللي محتاجه عشان حصتك تبقى مختلفة
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600 dark:text-slate-300">
          ست أدوات ومجتمعات في مكان واحد — من أول فكرة الصبح لحد تقييم يومك.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, href, color }) => (
            <Link key={title} href={href} className="group">
              <Card className="h-full p-6 transition-all group-hover:-translate-y-1 group-hover:border-electric/40 group-hover:shadow-lg">
                <span className={`inline-flex size-12 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-electric">
                  اكتشف المزيد <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-14 md:py-20 dark:bg-navy-light">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-navy md:text-3xl dark:text-white">
            إزاي تبدأ؟
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <Card key={step.n} className="p-6 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-electric to-accent text-xl font-extrabold text-white">
                  {step.n}
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {step.desc}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-navy p-8 text-center text-white">
            <HeartHandshake className="size-8 text-accent" />
            <h3 className="text-xl font-extrabold">مدرس يساعد مدرس</h3>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              محتاج فكرة شرح؟ نشاط؟ حل لمشكلة في الفصل؟ اسأل المجتمع — وردّ الجميل لما تساعد
              غيرك.
            </p>
            <Link href="/register">
              <Button variant="accent">انضم للمجتمع مجانًا</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center dark:border-slate-800">
        <p className="text-lg font-extrabold text-navy dark:text-white">
          الفصل <span className="text-sm tracking-widest text-electric">EL FASL</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          مش مجرد شرح.. تجربة مختلفة كل يوم.
        </p>
      </footer>
    </div>
  );
}
