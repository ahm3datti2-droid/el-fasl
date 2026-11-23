"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  DAILY_CHALLENGES,
  QUIZ_QUESTIONS,
  todayChallenge,
  todayQuiz,
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

function xpBadge(xp: number) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#7C5CFC]/10 px-2.5 py-1 text-xs font-bold text-[#7C5CFC]">
      <Star className="h-3.5 w-3.5" /> {xp} نقطة
    </span>
  );
}

export default function ChallengesPage() {
  const challenge = useMemo(() => todayChallenge(), []);
  const quiz = useMemo(() => todayQuiz(), []);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [quizPicked, setQuizPicked] = useState<number | null>(null);
  const [quizAwarded, setQuizAwarded] = useState<number | null>(null);
  const [streak, setStreak] = useState(3);
  const [totalXp, setTotalXp] = useState(120);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("elfasl-challenges-done");
      if (raw) setDoneIds(JSON.parse(raw) as string[]);
      const s = localStorage.getItem("elfasl-streak");
      if (s) setStreak(Number(s) || 3);
      const x = localStorage.getItem("elfasl-xp");
      if (x) setTotalXp(Number(x) || 120);
    } catch {
      /* storage unavailable — keep defaults */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("elfasl-challenges-done", JSON.stringify(doneIds));
      localStorage.setItem("elfasl-streak", String(streak));
      localStorage.setItem("elfasl-xp", String(totalXp));
    } catch {
      /* ignore */
    }
  }, [doneIds, streak, totalXp]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  }

  async function completeChallenge(id: string, xp: number) {
    if (doneIds.includes(id)) return;
    const awarded = await awardXp("complete_challenge", id);
    const gain = awarded ?? xp;
    setDoneIds((d) => [...d, id]);
    setTotalXp((t) => t + gain);
    setStreak((s) => s + (id === challenge.id ? 1 : 0));
    showToast(`مبروك! أكملت التحدي وكسبت ${gain} نقطة خبرة`);
  }

  async function answerQuiz(idx: number) {
    if (quizPicked !== null) return;
    setQuizPicked(idx);
    const correct = idx === quiz.correctIndex;
    const awarded = await awardXp(correct ? "answer_quiz_correct" : "answer_quiz_wrong", quiz.id);
    const gain = awarded ?? (correct ? quiz.xp : 5);
    setQuizAwarded(gain);
    setTotalXp((t) => t + gain);
  }

  const doneCount = doneIds.length;

  return (
    <div dir="rtl" style={FONT} className="min-h-screen bg-[#F5F7FB] pb-24 text-[#101828]">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">تحديات اليوم</h1>
            <p className="mt-1 text-sm text-slate-500">تحدي جديد كل يوم — جاوب، نفّذ، واجمع النقاط.</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-sm">
              <Flame className="h-4 w-4 text-orange-500" /> {streak} أيام متتالية
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#101828] px-3 py-1.5 text-sm font-bold text-white shadow-sm">
              <Trophy className="h-4 w-4 text-amber-400" /> {totalXp} نقطة
            </span>
          </div>
        </header>

        {/* Progress */}
        <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#4568FF]" /> تقدمك الأسبوعي
            </span>
            <span>{doneCount} / {DAILY_CHALLENGES.length} تحديات</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#4568FF] to-[#7C5CFC] transition-all duration-500"
              style={{ width: `${(doneCount / DAILY_CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Daily challenge */}
        <section className="mt-5 overflow-hidden rounded-3xl bg-[#101828] p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> تحدي اليوم
            </span>
            {xpBadge(challenge.xp)}
          </div>
          <h2 className="mt-4 text-xl font-extrabold leading-snug">{challenge.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{challenge.description}</p>
          <div className="mt-4">
            <p className="text-xs font-bold text-white/60">إزاي تنفذه؟</p>
            <ol className="mt-2 space-y-1.5 text-sm text-white/90">
              {challenge.howTo.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4568FF] text-[11px] font-bold">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <button
            onClick={() => completeChallenge(challenge.id, challenge.xp)}
            disabled={doneIds.includes(challenge.id)}
            className="mt-5 w-full rounded-xl bg-[#4568FF] py-3 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98] disabled:cursor-default disabled:bg-white/20 disabled:text-white/70"
          >
            {doneIds.includes(challenge.id) ? "تم إكمال تحدي اليوم — عاش يا بطل!" : "أكملت التحدي — خد نقاطك"}
          </button>
        </section>

        {/* Quiz of the day */}
        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <HelpCircle className="h-5 w-5 text-[#7C5CFC]" /> سؤال اليوم
            </h2>
            {xpBadge(quiz.xp)}
          </div>
          <p className="mt-1 text-xs text-slate-400">{quiz.category}</p>
          <p className="mt-3 text-base font-bold leading-relaxed">{quiz.question}</p>
          <div className="mt-4 space-y-2">
            {quiz.options.map((opt, i) => {
              const isCorrect = i === quiz.correctIndex;
              const isPicked = i === quizPicked;
              let cls = "border-slate-200 bg-slate-50 hover:border-[#4568FF] hover:bg-[#4568FF]/5";
              if (quizPicked !== null) {
                if (isCorrect) cls = "border-green-500 bg-green-50 text-green-800";
                else if (isPicked) cls = "border-red-400 bg-red-50 text-red-700";
                else cls = "border-slate-200 bg-slate-50 opacity-60";
              }
              return (
                <button
                  key={i}
                  onClick={() => answerQuiz(i)}
                  disabled={quizPicked !== null}
                  className={`flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-right text-sm font-bold transition active:scale-[0.99] ${cls}`}
                >
                  {quizPicked !== null && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />}
                  {quizPicked !== null && isPicked && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {quizPicked !== null && (
            <div className="mt-4 rounded-2xl bg-[#F5F7FB] p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                {quizPicked === quiz.correctIndex ? `إجابة صح! كسبت ${quizAwarded ?? quiz.xp} نقطة` : `إجابة غلط — بس كسبت ${quizAwarded ?? 5} نقاط للمحاولة`}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{quiz.explanation}</p>
              <button
                onClick={() => { setQuizPicked(null); setQuizAwarded(null); }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> جرّب تاني
              </button>
            </div>
          )}
        </section>

        {/* Week list */}
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <CalendarDays className="h-5 w-5 text-[#4568FF]" /> تحديات الأسبوع
          </h2>
          <div className="mt-3 space-y-3">
            {DAILY_CHALLENGES.map((c) => {
              const done = doneIds.includes(c.id);
              const isToday = c.id === challenge.id;
              return (
                <article
                  key={c.id}
                  className={`rounded-2xl bg-white p-4 shadow-sm transition ${isToday ? "ring-2 ring-[#4568FF]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#F5F7FB] px-2 py-0.5 text-[11px] font-bold text-slate-500">
                          اليوم {c.day}
                        </span>
                        <span className="rounded-full bg-[#7C5CFC]/10 px-2 py-0.5 text-[11px] font-bold text-[#7C5CFC]">{c.type}</span>
                        {isToday && <span className="rounded-full bg-[#4568FF] px-2 py-0.5 text-[11px] font-bold text-white">اليوم</span>}
                      </div>
                      <h3 className="mt-2 font-extrabold">{c.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{c.description}</p>
                    </div>
                    {xpBadge(c.xp)}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" /> نفّذه في حصتك النهاردة
                    </span>
                    <button
                      onClick={() => completeChallenge(c.id, c.xp)}
                      disabled={done}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition active:scale-95 ${
                        done ? "bg-green-100 text-green-700" : "bg-[#101828] text-white hover:bg-[#4568FF]"
                      }`}
                    >
                      {done ? (<><CheckCircle2 className="h-4 w-4" /> تم</>) : (<><Award className="h-4 w-4" /> أكملت التحدي</>)}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* All quiz questions teaser */}
        <section className="mt-6">
          <h2 className="text-lg font-extrabold">بنك أسئلة سريعة</h2>
          <p className="mt-1 text-sm text-slate-500">جرّب نفسك في أسئلة تربوية من بنك الأسئلة — كل سؤال صح بيكسبك نقاط.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {QUIZ_QUESTIONS.filter((q) => q.id !== quiz.id).slice(0, 4).map((q) => (
              <MiniQuiz key={q.id} q={q} />
            ))}
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#101828] px-5 py-3 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function MiniQuiz({ q }: { q: (typeof QUIZ_QUESTIONS)[number] }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm font-bold leading-relaxed">{q.question}</p>
      <div className="mt-3 space-y-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          let cls = "border-slate-200 bg-slate-50 hover:border-[#4568FF]";
          if (picked !== null) {
            if (isCorrect) cls = "border-green-500 bg-green-50 text-green-800";
            else if (i === picked) cls = "border-red-400 bg-red-50 text-red-700";
            else cls = "border-slate-200 bg-slate-50 opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              disabled={picked !== null}
              className={`w-full rounded-xl border px-3 py-2 text-right text-xs font-bold transition ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-3 rounded-xl bg-[#F5F7FB] p-3 text-xs leading-relaxed text-slate-600">{q.explanation}</p>
      )}
    </div>
  );
}
