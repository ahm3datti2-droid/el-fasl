"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  ListChecks,
  RefreshCw,
  Shuffle,
  Sparkles,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import {
  FLIP_ACTIVITY_TYPES,
  FLIP_IDEAS,
  FLIP_STAGES,
  FLIP_SUBJECTS,
  FLIP_TIMES,
  pickRandom,
  type FlipIdea,
} from "@/lib/features-data";

const FONT = { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" } as const;
const SAVED_KEY = "elfasl-flip-saved";

function timeMatches(idea: FlipIdea, filter: string): boolean {
  if (filter === "أي وقت") return true;
  if (filter === "أقل من 5 دقائق") return idea.timeMinutes < 5;
  if (filter === "5 - 10 دقائق") return idea.timeMinutes >= 5 && idea.timeMinutes <= 10;
  return idea.timeMinutes > 10;
}

const difficultyColor: Record<string, string> = {
  "سهل": "bg-green-100 text-green-700",
  "متوسط": "bg-amber-100 text-amber-700",
  "صعب": "bg-red-100 text-red-700",
};

export default function FlipClassPage() {
  const [subject, setSubject] = useState("كل المواد");
  const [stage, setStage] = useState("كل المراحل");
  const [activityType, setActivityType] = useState("كل الأنواع");
  const [time, setTime] = useState("أي وقت");
  const [students, setStudents] = useState("أي عدد");
  const [idea, setIdea] = useState<FlipIdea | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [saved, setSaved] = useState<FlipIdea[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(JSON.parse(raw) as FlipIdea[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }, [saved]);

  const filtered = useMemo(
    () =>
      FLIP_IDEAS.filter(
        (i) =>
          (subject === "كل المواد" || i.subject === "كل المواد" || i.subject === subject) &&
          (stage === "كل المراحل" || i.stage === "كل المراحل" || i.stage === stage) &&
          (activityType === "كل الأنواع" || i.activityType === activityType) &&
          timeMatches(i, time)
      ),
    [subject, stage, activityType, time]
  );

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }

  function generateIdea() {
    const pool = filtered.length > 0 ? filtered : FLIP_IDEAS;
    setSpinning(true);
    // Brief shuffle animation before settling on an idea
    let ticks = 0;
    const interval = window.setInterval(() => {
      setIdea(pickRandom(pool));
      ticks += 1;
      if (ticks >= 6) {
        window.clearInterval(interval);
        setIdea(pickRandom(pool));
        setSpinning(false);
      }
    }, 90);
  }

  function toggleSave(current: FlipIdea) {
    if (saved.some((s) => s.id === current.id)) {
      setSaved((prev) => prev.filter((s) => s.id !== current.id));
      showToast("اتشالت الفكرة من المحفوظات");
    } else {
      setSaved((prev) => [current, ...prev]);
      showToast("اتحفظت الفكرة — هتلاقيها تحت في أفكارك المحفوظة");
      // Small server-side XP nudge (server decides the amount)
      fetch("/api/gamification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_flip_idea", refId: current.id }),
      }).catch(() => undefined);
    }
  }

  const isSaved = idea ? saved.some((s) => s.id === idea.id) : false;

  return (
    <div dir="rtl" style={FONT} className="min-h-screen bg-[#F5F7FB] pb-24 text-[#101828]">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            <Shuffle className="h-6 w-6 text-[#7C5CFC]" /> اقلب الحصة
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            دوس على الزرار وهيطلعلك فكرة تدريس مبتكرة عشوائية — جرّبها النهاردة في حصتك.
          </p>
        </header>

        {/* Filters */}
        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold">ظبّط الفكرة على حصتك</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-slate-500">المادة</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#4568FF]">
                {FLIP_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">المرحلة التعليمية</span>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#4568FF]">
                {FLIP_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">نوع النشاط</span>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#4568FF]">
                {FLIP_ACTIVITY_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">وقت التنفيذ</span>
              <select value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#4568FF]">
                {FLIP_TIMES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-bold text-slate-500">عدد الطلاب في الفصل</span>
              <div className="mt-1 flex gap-2">
                {["أي عدد", "أقل من 20", "20 - 35", "أكثر من 35"].map((n) => (
                  <button
                    key={n}
                    onClick={() => setStudents(n)}
                    className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-extrabold transition active:scale-95 ${
                      students === n ? "bg-[#101828] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </label>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5" />
            {filtered.length > 0
              ? `فيه ${filtered.length} فكرة مناسبة للفلاتر دي`
              : "مفيش فكرة مطابقة للفلاتر دي بالظبط — هنختار من كل الأفكار"}
            {students !== "أي عدد" && ` • الفصل فيه ${students} طالب`}
          </p>
        </section>

        {/* Big button */}
        <button
          onClick={generateIdea}
          disabled={spinning}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-l from-[#4568FF] to-[#7C5CFC] py-5 text-xl font-extrabold text-white shadow-lg transition hover:opacity-95 active:scale-[0.98] disabled:opacity-80"
        >
          <RefreshCw className={`h-6 w-6 ${spinning ? "animate-spin" : ""}`} />
          {spinning ? "بنقلب الحصة..." : "اقلب الحصة"}
        </button>

        {/* Idea card */}
        {!idea && (
          <div className="mt-5 rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[#7C5CFC]" />
            <p className="mt-3 font-extrabold">لسه ماقلبتش الحصة؟</p>
            <p className="mt-1 text-sm text-slate-500">دوس على الزرار وهتطلعلك فكرة مبتكرة بالخطوات والأدوات والوقت.</p>
          </div>
        )}

        {idea && (
          <article key={idea.id + String(spinning)} className="mt-5 overflow-hidden rounded-3xl bg-white shadow-md">
            <div className="bg-[#101828] p-5 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold">{idea.activityType}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold">{idea.subject}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold">{idea.stage}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${difficultyColor[idea.difficulty]}`}>
                  {idea.difficulty}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-extrabold leading-snug">{idea.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{idea.description}</p>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F7FB] px-3 py-1.5 text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-[#4568FF]" /> {idea.timeMinutes} {idea.timeMinutes === 1 ? "دقيقة" : "دقائق"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F7FB] px-3 py-1.5 text-slate-600">
                  <Users className="h-3.5 w-3.5 text-[#4568FF]" /> {students === "أي عدد" ? "أي عدد طلاب" : `${students} طالب`}
                </span>
              </div>
              <h3 className="mt-4 flex items-center gap-2 text-sm font-extrabold">
                <ListChecks className="h-4 w-4 text-[#4568FF]" /> خطوات التنفيذ
              </h3>
              <ol className="mt-2 space-y-2">
                {idea.steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4568FF]/10 text-xs font-extrabold text-[#4568FF]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <h3 className="mt-4 flex items-center gap-2 text-sm font-extrabold">
                <Wrench className="h-4 w-4 text-[#4568FF]" /> الأدوات المطلوبة
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {idea.tools.map((t) => (
                  <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">{t}</span>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={generateIdea}
                  disabled={spinning}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98] disabled:opacity-70"
                >
                  <RefreshCw className="h-4 w-4" /> فكرة جديدة
                </button>
                <button
                  onClick={() => toggleSave(idea)}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold transition active:scale-[0.98] ${
                    isSaved ? "bg-[#7C5CFC]/15 text-[#7C5CFC]" : "bg-[#101828] text-white hover:bg-[#7C5CFC]"
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {isSaved ? "محفوظة" : "احفظ الفكرة"}
                </button>
              </div>
            </div>
          </article>
        )}

        {/* Saved ideas */}
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Bookmark className="h-5 w-5 text-[#7C5CFC]" /> أفكارك المحفوظة ({saved.length})
          </h2>
          {saved.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
              لسه محفظتش أفكار — لما تعجبك فكرة دوس «احفظ الفكرة» وهتلاقيها هنا.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {saved.map((s) => (
                <article key={s.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <button
                    className="text-right"
                    onClick={() => { setIdea(s); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    <h3 className="font-extrabold leading-snug">{s.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {s.activityType} • {s.subject} • {s.timeMinutes} {s.timeMinutes === 1 ? "دقيقة" : "دقائق"} • {s.difficulty}
                    </p>
                  </button>
                  <button
                    onClick={() => setSaved((prev) => prev.filter((x) => x.id !== s.id))}
                    aria-label="حذف من المحفوظات"
                    className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* All ideas browse */}
        <section className="mt-6">
          <h2 className="text-lg font-extrabold">كل الأفكار ({FLIP_IDEAS.length})</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {FLIP_IDEAS.map((f) => (
              <button
                key={f.id}
                onClick={() => { setIdea(f); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="rounded-2xl bg-white p-4 text-right shadow-sm transition hover:shadow-md active:scale-[0.99]"
              >
                <span className="rounded-full bg-[#7C5CFC]/10 px-2 py-0.5 text-[11px] font-bold text-[#7C5CFC]">{f.activityType}</span>
                <h3 className="mt-2 font-extrabold leading-snug">{f.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{f.description}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">{f.timeMinutes} {f.timeMinutes === 1 ? "دقيقة" : "دقائق"} • {f.difficulty}</p>
              </button>
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
