// EL FASL — daily situation card (client component): pick a response, then see
// the analysis. No answer is framed as simply right/wrong — each choice shows
// its strengths, weaknesses, and a better alternative.
"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Lightbulb, MessageCircle, RotateCcw, Zap } from "lucide-react";
import { Button, ProgressBar } from "./ui";

interface Choice {
  id: string;
  label: string;
  score: number; // 0..100 — quality of the response, not a pass/fail
  feedback: string;
  strength: string;
  weakness: string;
}

const CHOICES: Choice[] = [
  {
    id: "calm",
    label: "أتعامل بهدوء وأكمل الشرح",
    score: 85,
    feedback: "قرار متوازن: حافظت على هدوء الفصل ولم تمنح المقاطعة اهتمامًا أكبر من حجمها.",
    strength: "يحافظ على هيبة المدرس ووقت الحصة، ويعلّم الفصل أن المقاطعة لا توقف الشرح.",
    weakness: "لو تكررت المقاطعة، قد يفهمها الطالب تجاهلًا ويزيد منها.",
  },
  {
    id: "confront",
    label: "أواجهه أمام الفصل",
    score: 40,
    feedback: "المواجهة العلنية غالبًا تتحول لصراع إرادات وتكسر العلاقة مع الطالب.",
    strength: "قد توقف المقاطعة لحظيًا وتُظهر حزمًا.",
    weakness: "تُحرج الطالب أمام زملائه، وقد يرد بعناد أو انسحاب، وتضيع الحصة كلها.",
  },
  {
    id: "stop",
    label: "أوقف الشرح وأتكلم معاه",
    score: 70,
    feedback: "قرار جيد لو كان بهدوء واختصار، لكنه يمنح المقاطعة مكافأة: توقف الشرح.",
    strength: "يوضّح الحدود مباشرة ويمنع تراكم التوتر.",
    weakness: "يوقف إيقاع الحصة، ولو طال الكلام خسرت تركيز باقي الفصل.",
  },
  {
    id: "different",
    label: "عندي تصرف مختلف",
    score: 90,
    feedback: "أفضل تصرف غالبًا يكون خاصًا وليس علنيًا: كلمة جانبية بعد الحصة أو تكليفه بدور.",
    strength: "يحفظ كرامة الطالب، ويكشف سبب المقاطعة الحقيقي (ملل؟ لفت انتباه؟ صعوبة؟).",
    weakness: "يحتاج صبرًا ومتابعة، وليس حلًا فوريًا داخل الحصة.",
  },
];

export default function DailySituation() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = CHOICES.find((c) => c.id === selectedId) ?? null;

  return (
    <div>
      <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
        طالب بيقاطعك باستمرار، وكل ما تبدأ الشرح يحاول يلفت انتباه الفصل. هتتصرف إزاي؟
      </p>

      {!selected ? (
        <div className="mt-4 grid gap-2">
          {CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => setSelectedId(choice.id)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-start text-sm font-semibold text-navy transition-all hover:border-electric hover:bg-electric/5 active:scale-[0.99] dark:border-slate-700 dark:text-white dark:hover:border-electric"
            >
              {choice.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-soft p-4 dark:bg-navy">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-bold text-navy dark:text-white">
                <Check className="size-4 text-emerald-500" /> اختيارك: {selected.label}
              </span>
              <span className="text-sm font-extrabold text-electric">{selected.score}/100</span>
            </div>
            <ProgressBar value={selected.score} className="mt-2" />
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {selected.feedback}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900 dark:bg-emerald-950/40">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                نقاط القوة
              </p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-900/80 dark:text-emerald-100/80">
                {selected.strength}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900 dark:bg-amber-950/40">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">انتبه لـ</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900/80 dark:text-amber-100/80">
                {selected.weakness}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-violet-50 p-3.5 text-sm leading-relaxed text-violet-900 dark:bg-violet-950/40 dark:text-violet-100">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
            <span>
              <strong>اقتراح عملي:</strong> اتفق مع الطالب على إشارة خاصة بينكما، وكلّفه بمهمة
              داخل الحصة (توزيع أوراق، كتابة على السبورة) — المقاطعة غالبًا طلب دور، مش طلب
              مشكلة.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-electric/10 px-3 py-1 text-xs font-bold text-electric">
              <Zap className="size-3.5" /> +10 XP لإكمال الموقف
            </span>
            <Link href="/teacher-unfiltered">
              <Button variant="secondary" size="sm">
                <MessageCircle className="size-4" /> شارك رأيك مع المدرسين
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
              <RotateCcw className="size-4" /> جرّب اختيار تاني
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
