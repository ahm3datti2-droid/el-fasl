"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Drama,
  Flame,
  Lightbulb,
  Play,
  RefreshCw,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  SCENARIO_CATEGORIES,
  SIMULATOR_SCENARIOS,
  type ScenarioCategory,
  type SimulatorChoice,
  type SimulatorScenario,
} from "@/lib/features-data";

const FONT = { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" } as const;

async function awardXp(action: string, refId?: string): Promise<number | null> {
  try {
    const res = await fetch("/api/gamification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, refId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.awarded === "number" ? data.awarded : null;
  } catch {
    return null;
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`تقييم ${rating} من 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </span>
  );
}

function ratingLabel(rating: number): string {
  if (rating >= 5) return "قرار ممتاز";
  if (rating >= 4) return "قرار جيد جدًا";
  if (rating >= 3) return "قرار مقبول";
  if (rating >= 2) return "قرار ضعيف";
  return "قرار يحتاج مراجعة";
}

export default function SimulatorPage() {
  const [filter, setFilter] = useState<ScenarioCategory | "الكل">("الكل");
  const [active, setActive] = useState<SimulatorScenario | null>(null);
  const [choice, setChoice] = useState<SimulatorChoice | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("elfasl-sim-completed");
      if (raw) setCompleted(JSON.parse(raw) as string[]);
      const x = localStorage.getItem("elfasl-sim-xp");
      if (x) setXp(Number(x) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("elfasl-sim-completed", JSON.stringify(completed));
      localStorage.setItem("elfasl-sim-xp", String(xp));
    } catch {
      /* ignore */
    }
  }, [completed, xp]);

  const list = useMemo(
    () => (filter === "الكل" ? SIMULATOR_SCENARIOS : SIMULATOR_SCENARIOS.filter((s) => s.category === filter)),
    [filter]
  );

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  }

  async function pickChoice(c: SimulatorChoice) {
    setChoice(c);
    if (active && !completed.includes(active.id)) {
      const awarded = await awardXp("complete_scenario", active.id);
      const gain = awarded ?? c.xp;
      setCompleted((prev) => [...prev, active.id]);
      setXp((prev) => prev + gain);
      showToast(`كسبت ${gain} نقطة خبرة من السيناريو ده`);
    }
  }

  function backToList() {
    setActive(null);
    setChoice(null);
  }

  const difficultyColor: Record<string, string> = {
    "سهل": "bg-green-100 text-green-700",
    "متوسط": "bg-amber-100 text-amber-700",
    "صعب": "bg-red-100 text-red-700",
  };

  return (
    <div dir="rtl" style={FONT} className="min-h-screen bg-[#F5F7FB] pb-24 text-[#101828]">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold">
              <Drama className="h-6 w-6 text-[#7C5CFC]" /> محاكي المدرس
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              مواقف حقيقية من الفصل — اختار قرارك، وشوف النتيجة والتقييم التربوي. مفيش صح وغلط بس، فيه تحليل لكل اختيار.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#101828] px-3 py-1.5 text-sm font-bold text-white shadow-sm">
            <Trophy className="h-4 w-4 text-amber-400" /> {xp} نقطة
          </span>
        </header>

        {/* Progress */}
        <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#4568FF]" /> تقدمك في المحاكي
            </span>
            <span>{completed.length} / {SIMULATOR_SCENARIOS.length} سيناريوهات</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#4568FF] to-[#7C5CFC] transition-all duration-500"
              style={{ width: `${(completed.length / SIMULATOR_SCENARIOS.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">كل سيناريو تكمله لأول مرة بيكسبك نقاط خبرة — جرّب كل التصنيفات.</p>
        </div>

        {!active && (
          <>
            {/* Category filter */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["الكل", ...SCENARIO_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition active:scale-95 ${
                    filter === cat ? "bg-[#101828] text-white shadow" : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scenario list */}
            <div className="mt-4 space-y-3">
              {list.map((s) => {
                const done = completed.includes(s.id);
                return (
                  <article key={s.id} className="rounded-3xl bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#7C5CFC]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#7C5CFC]">{s.category}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${difficultyColor[s.difficulty]}`}>
                            {s.difficulty}
                          </span>
                          {done && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                              <CheckCircle2 className="h-3 w-3" /> تم
                            </span>
                          )}
                        </div>
                        <h2 className="mt-3 text-lg font-extrabold leading-snug">{s.title}</h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.scenario}</p>
                        <p className="mt-2 text-xs text-slate-400">{s.context}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActive(s); setChoice(null); }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98]"
                    >
                      <Play className="h-4 w-4" /> {done ? "العب السيناريو تاني" : "ابدأ السيناريو"}
                    </button>
                  </article>
                );
              })}
              {list.length === 0 && (
                <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                  مفيش سيناريوهات في التصنيف ده لسه — جرّب تصنيف تاني.
                </p>
              )}
            </div>
          </>
        )}

        {/* Play flow */}
        {active && !choice && (
          <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
            <button onClick={backToList} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 transition hover:text-[#4568FF]">
              <ArrowRight className="h-4 w-4" /> كل السيناريوهات
            </button>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#7C5CFC]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#7C5CFC]">{active.category}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${difficultyColor[active.difficulty]}`}>
                مستوى {active.difficulty}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-extrabold leading-snug">{active.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{active.scenario}</p>
            <p className="mt-2 text-xs text-slate-400">{active.context}</p>
            <h3 className="mt-5 text-sm font-extrabold">هتتصرف إزاي؟</h3>
            <div className="mt-3 space-y-2">
              {active.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => pickChoice(c)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-right text-sm font-bold leading-relaxed transition hover:border-[#4568FF] hover:bg-[#4568FF]/5 active:scale-[0.99]"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Result */}
        {active && choice && (
          <section className="mt-5 space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <button onClick={backToList} className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 transition hover:text-[#4568FF]">
                <ArrowRight className="h-4 w-4" /> كل السيناريوهات
              </button>
              <h2 className="mt-3 text-lg font-extrabold leading-snug">{active.title}</h2>
              <p className="mt-2 rounded-2xl bg-[#F5F7FB] p-3 text-sm leading-relaxed text-slate-600">
                <span className="font-extrabold text-[#101828]">اختيارك: </span>{choice.label}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Stars rating={choice.rating} />
                <span className="text-sm font-extrabold">{ratingLabel(choice.rating)}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#7C5CFC]/10 px-2.5 py-1 text-xs font-bold text-[#7C5CFC]">
                  <Flame className="h-3.5 w-3.5" /> +{choice.xp} نقطة
                </span>
              </div>

              <h3 className="mt-5 text-sm font-extrabold">إيه اللي حصل؟</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{choice.result}</p>

              <h3 className="mt-5 flex items-center gap-2 text-sm font-extrabold">
                <ShieldCheck className="h-4 w-4 text-[#4568FF]" /> التفسير التربوي
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{choice.analysis}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-green-50 p-4">
                  <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-green-800">
                    <ThumbsUp className="h-4 w-4" /> نقاط القوة
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-green-900/80">
                    {choice.strengths.length > 0 ? choice.strengths.map((s, i) => <li key={i}>• {s}</li>) : <li>• مفيش نقاط قوة واضحة في الاختيار ده.</li>}
                  </ul>
                </div>
                <div className="rounded-2xl bg-red-50 p-4">
                  <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-red-800">
                    <ThumbsDown className="h-4 w-4" /> نقاط الضعف
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-red-900/80">
                    {choice.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-amber-800">
                  <Lightbulb className="h-4 w-4" /> حل بديل ممكن تجربه
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-amber-900/80">{choice.alternative}</p>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setChoice(null)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  <RefreshCw className="h-4 w-4" /> جرّب اختيار تاني
                </button>
                <button
                  onClick={backToList}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#101828] py-3 text-sm font-extrabold text-white transition hover:bg-[#4568FF] active:scale-[0.98]"
                >
                  سيناريو جديد
                </button>
              </div>
            </div>

            {/* Try other choices quick view */}
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="text-sm font-extrabold">جرّب باقي الاختيارات وشوف نتائجها</h3>
              <div className="mt-3 space-y-2">
                {active.choices.filter((c) => c.id !== choice.id).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => pickChoice(c)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-right text-sm font-bold transition hover:border-[#7C5CFC] hover:bg-[#7C5CFC]/5"
                  >
                    <span>{c.label}</span>
                    <XCircle className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#101828] px-5 py-3 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
