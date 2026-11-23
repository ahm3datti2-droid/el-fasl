"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clock,
  Crown,
  Dices,
  Gift,
  HelpCircle,
  Layers,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  Timer as TimerIcon,
  Trash2,
  Trophy,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import {
  CHALLENGE_CARDS,
  QUICK_ACTIVITIES,
  RANDOM_QUESTIONS,
  SURPRISE_BOX,
  pickRandom,
} from "@/lib/features-data";

const FONT = { fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" } as const;
const NAMES_KEY = "elfasl-student-names";
const SAMPLE_NAMES = ["أحمد", "سارة", "محمد", "منى", "عمر", "نور", "يوسف", "فاطمة", "كريم", "هدى", "مصطفى", "جنى"];

const WHEEL_COLORS = ["#4568FF", "#7C5CFC", "#101828", "#38BDF8", "#F59E0B", "#22C55E", "#EC4899", "#14B8A6"];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type ToolId =
  | "picker" | "name-wheel" | "question-wheel" | "teams" | "timer" | "sixty"
  | "scoreboard" | "random-question" | "leader" | "activity" | "challenge-card" | "surprise";

const TOOLS: { id: ToolId; name: string; desc: string; icon: typeof Dices }[] = [
  { id: "picker", name: "اختيار طالب عشوائي", desc: "اختار طالب بطريقة مرئية ممتعة", icon: Dices },
  { id: "name-wheel", name: "عجلة أسماء", desc: "لف العجلة وسيب الحظ يختار", icon: RotateCcw },
  { id: "question-wheel", name: "عجلة أسئلة", desc: "عجلة تدور على سؤال عشوائي", icon: HelpCircle },
  { id: "teams", name: "تقسيم الفصل لمجموعات", desc: "قسّم الطلاب لفرق متوازنة", icon: Users },
  { id: "timer", name: "مؤقت", desc: "30 ثانية لحد 10 دقائق أو وقت مخصص", icon: TimerIcon },
  { id: "sixty", name: "تحدي 60 ثانية", desc: "تحدي سريع ضد الوقت", icon: Zap },
  { id: "scoreboard", name: "نظام نقاط للفرق", desc: "لوحة نقاط واضحة للفرق", icon: Trophy },
  { id: "random-question", name: "سؤال عشوائي", desc: "سؤال نقاش جاهز في ثانية", icon: Sparkles },
  { id: "leader", name: "اختيار قائد الفريق", desc: "اختار قائد لكل فريق", icon: Crown },
  { id: "activity", name: "مولد نشاط", desc: "نشاط سريع جاهز للفصل", icon: Wand2 },
  { id: "challenge-card", name: "بطاقة تحدي", desc: "اسحب بطاقة تحدي ونفذها", icon: Layers },
  { id: "surprise", name: "صندوق المفاجآت", desc: "افتح الصندوق وشوف المفاجأة", icon: Gift },
];

export default function ClassroomToolsPage() {
  const [active, setActive] = useState<ToolId>("picker");
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NAMES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) setNames(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NAMES_KEY, JSON.stringify(names));
    } catch {
      /* ignore */
    }
  }, [names]);

  function addName() {
    const n = newName.trim();
    if (!n) return;
    if (names.includes(n)) {
      setNewName("");
      return;
    }
    setNames((prev) => [...prev, n]);
    setNewName("");
  }

  const activeTool = TOOLS.find((t) => t.id === active)!;

  return (
    <div dir="rtl" style={FONT} className="min-h-screen bg-[#F5F7FB] pb-24 text-[#101828]">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            <Wand2 className="h-6 w-6 text-[#7C5CFC]" /> أدوات الفصل
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            12 أداة جاهزة للاستخدام على شاشة الفصل أو الموبايل — من غير تحميل ولا تعقيد.
          </p>
        </header>

        {/* Names manager */}
        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-extrabold">
            <Users className="h-5 w-5 text-[#4568FF]" /> أسماء الطلاب ({names.length})
          </h2>
          <p className="mt-1 text-xs text-slate-400">الأسماء دي بتستخدم في: الاختيار العشوائي، عجلة الأسماء، تقسيم الفرق، واختيار القائد.</p>
          <div className="mt-3 flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addName(); }}
              placeholder="اكتب اسم الطالب..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#4568FF]"
            />
            <button onClick={addName} className="inline-flex items-center gap-1 rounded-xl bg-[#4568FF] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-95">
              <Plus className="h-4 w-4" /> إضافة
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {names.length === 0 && (
              <button
                onClick={() => setNames(SAMPLE_NAMES)}
                className="rounded-full border border-dashed border-[#4568FF] px-3 py-1.5 text-xs font-bold text-[#4568FF] transition hover:bg-[#4568FF]/5"
              >
                جرّب بأسماء تجريبية ({SAMPLE_NAMES.length} طالب)
              </button>
            )}
            {names.map((n) => (
              <span key={n} className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F7FB] py-1.5 pr-3 pl-1.5 text-xs font-bold">
                {n}
                <button onClick={() => setNames((prev) => prev.filter((x) => x !== n))} aria-label={`حذف ${n}`} className="rounded-full p-0.5 text-slate-400 hover:bg-red-100 hover:text-red-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {names.length > 0 && (
              <button onClick={() => setNames([])} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> مسح الكل
              </button>
            )}
          </div>
        </section>

        {/* Tool grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const selected = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`rounded-2xl p-4 text-right shadow-sm transition active:scale-[0.97] ${
                  selected ? "bg-[#101828] text-white ring-2 ring-[#4568FF]" : "bg-white hover:shadow-md"
                }`}
              >
                <Icon className={`h-5 w-5 ${selected ? "text-amber-300" : "text-[#4568FF]"}`} />
                <p className="mt-2 text-sm font-extrabold leading-snug">{t.name}</p>
                <p className={`mt-1 text-[11px] leading-relaxed ${selected ? "text-white/70" : "text-slate-400"}`}>{t.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Active tool panel */}
        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <activeTool.icon className="h-5 w-5 text-[#7C5CFC]" /> {activeTool.name}
          </h2>

          {active === "picker" && <RandomPicker names={names} />}
          {active === "name-wheel" && <NameWheel names={names} />}
          {active === "question-wheel" && <QuestionWheel />}
          {active === "teams" && <TeamGenerator names={names} />}
          {active === "timer" && <TimerTool />}
          {active === "sixty" && <SixtySecondChallenge />}
          {active === "scoreboard" && <Scoreboard />}
          {active === "random-question" && <RandomQuestion />}
          {active === "leader" && <LeaderPicker names={names} />}
          {active === "activity" && <ActivityGenerator />}
          {active === "challenge-card" && <ChallengeCard />}
          {active === "surprise" && <SurpriseBox />}
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Random student picker
// ---------------------------------------------------------------------------
function RandomPicker({ names }: { names: string[] }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [cycling, setCycling] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  function pick() {
    if (names.length === 0 || cycling) return;
    setCycling(true);
    let ticks = 0;
    timerRef.current = window.setInterval(() => {
      setCurrent(pickRandom(names));
      ticks += 1;
      if (ticks >= 14) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        const winner = pickRandom(names);
        setCurrent(winner);
        setHistory((h) => [winner, ...h].slice(0, 5));
        setCycling(false);
      }
    }, 70);
  }

  return (
    <div className="mt-4">
      {names.length === 0 ? (
        <EmptyNames />
      ) : (
        <>
          <div className={`flex min-h-28 items-center justify-center rounded-2xl bg-[#F5F7FB] p-6 text-center ${cycling ? "animate-pulse" : ""}`}>
            <span className="text-3xl font-extrabold text-[#101828]">{current ?? "؟"}</span>
          </div>
          <button
            onClick={pick}
            disabled={cycling}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98] disabled:opacity-70"
          >
            <Shuffle className="h-4 w-4" /> {cycling ? "بنختار..." : "اختار طالب عشوائي"}
          </button>
          {history.length > 0 && (
            <p className="mt-3 text-xs text-slate-400">آخر الاختيارات: {history.join(" • ")}</p>
          )}
        </>
      )}
    </div>
  );
}

function EmptyNames() {
  return (
    <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
      ضيف أسماء الطلاب فوق الأول (أو جرّب الأسماء التجريبية) عشان الأداة دي تشتغل.
    </p>
  );
}

// ---------------------------------------------------------------------------
// 2 & 3. Spin wheels (generic)
// ---------------------------------------------------------------------------
function SpinWheel({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const seg = 360 / Math.max(items.length, 1);

  const gradient = useMemo(() => {
    if (items.length === 0) return "#e2e8f0";
    const parts = items.map((_, i) => {
      const c = WHEEL_COLORS[i % WHEEL_COLORS.length];
      return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
    });
    return `conic-gradient(${parts.join(", ")})`;
  }, [items, seg]);

  function spin() {
    if (items.length === 0 || spinning) return;
    setSpinning(true);
    setWinner(null);
    const extra = 1440 + Math.floor(Math.random() * 360);
    const finalRotation = rotation + extra;
    setRotation(finalRotation);
    window.setTimeout(() => {
      const normalized = ((360 - (finalRotation % 360)) % 360 + 360) % 360;
      const idx = Math.floor(normalized / seg) % items.length;
      setWinner(items[idx]);
      setSpinning(false);
    }, 2100);
  }

  if (items.length === 0) {
    return <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">{emptyLabel}</p>;
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      <div className="relative">
        <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 text-2xl leading-none text-[#101828]">▼</div>
        <div
          className="relative h-64 w-64 overflow-hidden rounded-full shadow-lg transition-transform duration-[2000ms] ease-out sm:h-72 sm:w-72"
          style={{ transform: `rotate(${rotation}deg)`, background: gradient }}
        >
          {items.map((item, i) => (
            <div
              key={`${item}-${i}`}
              className="absolute inset-0 flex justify-center"
              style={{ transform: `rotate(${i * seg + seg / 2}deg)` }}
            >
              <span className="mt-3 max-w-16 truncate text-center text-xs font-extrabold text-white drop-shadow">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={spin}
        disabled={spinning}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C5CFC] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#6a4de0] active:scale-[0.98] disabled:opacity-70"
      >
        <RotateCcw className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} /> {spinning ? "العجلة بتدور..." : "لف العجلة"}
      </button>
      {winner && !spinning && (
        <p className="mt-4 w-full rounded-2xl bg-green-50 p-4 text-center text-base font-extrabold text-green-800">
          النتيجة: {winner}
        </p>
      )}
    </div>
  );
}

function NameWheel({ names }: { names: string[] }) {
  if (names.length === 0) return <EmptyNames />;
  if (names.length === 1) {
    return <p className="mt-4 rounded-2xl bg-[#F5F7FB] p-4 text-center text-sm font-bold">ضيف اسم واحد كمان على الأقل عشان العجلة تدور.</p>;
  }
  return <SpinWheel items={names} emptyLabel="" />;
}

function QuestionWheel() {
  return <SpinWheel items={RANDOM_QUESTIONS} emptyLabel="" />;
}

// ---------------------------------------------------------------------------
// 4. Team generator
// ---------------------------------------------------------------------------
function TeamGenerator({ names }: { names: string[] }) {
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);

  function generate() {
    if (names.length < teamCount) return;
    const shuffled = shuffle(names);
    const result: string[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((name, i) => {
      result[i % teamCount].push(name);
    });
    setTeams(result);
  }

  function regenerate() {
    generate();
  }

  return (
    <div className="mt-4">
      {names.length === 0 ? (
        <EmptyNames />
      ) : (
        <>
          <label className="text-xs font-bold text-slate-500">عدد الفرق</label>
          <div className="mt-1 flex gap-2">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setTeamCount(n)}
                disabled={n > names.length}
                className={`flex-1 rounded-xl py-2.5 text-sm font-extrabold transition active:scale-95 disabled:opacity-40 ${
                  teamCount === n ? "bg-[#101828] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {names.length} طالب • كل فريق هيبقى فيه حوالي {Math.ceil(names.length / teamCount)} طلاب
          </p>
          <button
            onClick={generate}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98]"
          >
            <Users className="h-4 w-4" /> قسّم الفرق
          </button>
          {teams.length > 0 && (
            <>
              <button onClick={regenerate} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50">
                <Shuffle className="h-3.5 w-3.5" /> إعادة التقسيم
              </button>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {teams.map((team, i) => (
                  <div key={i} className="rounded-2xl bg-[#F5F7FB] p-4" style={{ borderTop: `4px solid ${WHEEL_COLORS[i % WHEEL_COLORS.length]}` }}>
                    <h3 className="font-extrabold">الفريق {i + 1} <span className="text-xs font-bold text-slate-400">({team.length} طلاب)</span></h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      {team.map((n) => <li key={n}>• {n}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Timer
// ---------------------------------------------------------------------------
const TIMER_PRESETS = [
  { label: "30 ثانية", seconds: 30 },
  { label: "دقيقة", seconds: 60 },
  { label: "5 دقائق", seconds: 300 },
  { label: "10 دقائق", seconds: 600 },
];

function TimerTool() {
  const [total, setTotal] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("3");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function setPreset(seconds: number) {
    setTotal(seconds);
    setRemaining(seconds);
    setRunning(false);
    setDone(false);
  }

  function setCustom() {
    const m = Math.max(1, Math.min(120, Number(customMinutes) || 1));
    setPreset(m * 60);
  }

  const progress = total > 0 ? (remaining / total) * 100 : 0;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {TIMER_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setPreset(p.seconds)}
            className={`rounded-full px-4 py-2 text-xs font-extrabold transition active:scale-95 ${
              total === p.seconds && !running ? "bg-[#101828] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          min={1}
          max={120}
          value={customMinutes}
          onChange={(e) => setCustomMinutes(e.target.value)}
          placeholder="دقائق"
          className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#4568FF]"
        />
        <button onClick={setCustom} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition hover:bg-slate-200 active:scale-95">
          وقت مخصص (دقائق)
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-[#101828] p-6 text-center text-white">
        <p className={`text-5xl font-extrabold tracking-wider ${done ? "text-amber-300" : ""}`}>
          {formatTime(remaining)}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-gradient-to-l from-[#4568FF] to-[#7C5CFC] transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-sm text-white/70">
          {done ? "خلص الوقت! عاش" : running ? "المؤقت شغال..." : "جاهز؟ دوس ابدأ"}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => { if (remaining > 0) { setRunning((r) => !r); setDone(false); } }}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98]"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "إيقاف مؤقت" : "ابدأ"}
        </button>
        <button
          onClick={() => { setRunning(false); setRemaining(total); setDone(false); }}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" /> إعادة
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. 60-second challenge
// ---------------------------------------------------------------------------
function SixtySecondChallenge() {
  const [challenge, setChallenge] = useState(() => pickRandom(CHALLENGE_CARDS));
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function newChallenge() {
    setChallenge(pickRandom(CHALLENGE_CARDS));
    setRemaining(60);
    setRunning(false);
    setFinished(false);
  }

  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-[#7C5CFC]/10 p-4">
        <p className="text-xs font-bold text-[#7C5CFC]">التحدي</p>
        <h3 className="mt-1 text-lg font-extrabold leading-snug">{challenge.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{challenge.description}</p>
        <p className="mt-2 text-xs font-bold text-slate-400">+{challenge.xp} نقطة لو نفذته في الوقت</p>
      </div>
      <p className={`mt-4 text-center text-5xl font-extrabold ${remaining <= 10 && running ? "text-red-500" : ""}`}>
        {formatTime(remaining)}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#7C5CFC] transition-all duration-1000" style={{ width: `${(remaining / 60) * 100}%` }} />
      </div>
      {finished && (
        <p className="mt-3 rounded-2xl bg-green-50 p-3 text-center text-sm font-extrabold text-green-800">
          خلصت الـ60 ثانية! نفذت التحدي؟ عاش يا بطل
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => { if (remaining > 0) setRunning((r) => !r); }}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98]"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "إيقاف مؤقت" : finished ? "ابدأ من جديد" : "ابدأ التحدي"}
        </button>
        <button onClick={newChallenge} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]">
          <Shuffle className="h-4 w-4" /> تحدي جديد
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. Scoreboard
// ---------------------------------------------------------------------------
interface TeamScore { id: number; name: string; points: number }

function Scoreboard() {
  const [teams, setTeams] = useState<TeamScore[]>([
    { id: 1, name: "الفريق الأول", points: 0 },
    { id: 2, name: "الفريق الثاني", points: 0 },
  ]);
  const [newTeam, setNewTeam] = useState("");

  function addTeam() {
    const n = newTeam.trim() || `الفريق ${teams.length + 1}`;
    setTeams((prev) => [...prev, { id: Date.now(), name: n, points: 0 }]);
    setNewTeam("");
  }

  function changePoints(id: number, delta: number) {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, points: Math.max(0, t.points + delta) } : t)));
  }

  const leader = teams.length > 0 ? [...teams].sort((a, b) => b.points - a.points)[0] : null;

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <input
          value={newTeam}
          onChange={(e) => setNewTeam(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addTeam(); }}
          placeholder="اسم فريق جديد..."
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#4568FF]"
        />
        <button onClick={addTeam} className="inline-flex items-center gap-1 rounded-xl bg-[#4568FF] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-95">
          <Plus className="h-4 w-4" /> فريق
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {teams.map((t, i) => {
          const isLeader = leader !== null && t.id === leader.id && t.points > 0;
          return (
            <div
              key={t.id}
              className={`rounded-2xl p-4 ${isLeader ? "bg-amber-50 ring-2 ring-amber-300" : "bg-[#F5F7FB]"}`}
              style={{ borderTop: `4px solid ${WHEEL_COLORS[i % WHEEL_COLORS.length]}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-extrabold">
                  {isLeader && <Crown className="h-4 w-4 text-amber-500" />} {t.name}
                </h3>
                <button onClick={() => setTeams((prev) => prev.filter((x) => x.id !== t.id))} aria-label={`حذف ${t.name}`} className="rounded-full p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button onClick={() => changePoints(t.id, -1)} aria-label="تقليل نقطة" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-red-50 active:scale-90">
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-4xl font-extrabold">{t.points}</span>
                <button onClick={() => changePoints(t.id, 1)} aria-label="زيادة نقطة" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4568FF] text-white shadow-sm transition hover:bg-[#3a5ae0] active:scale-90">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 flex justify-center gap-2">
                <button onClick={() => changePoints(t.id, 5)} className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm transition hover:bg-green-50 active:scale-95">+5</button>
                <button onClick={() => changePoints(t.id, -5)} className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm transition hover:bg-red-50 active:scale-95">-5</button>
              </div>
            </div>
          );
        })}
      </div>

      {teams.length > 0 && (
        <button
          onClick={() => setTeams((prev) => prev.map((t) => ({ ...t, points: 0 })))}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" /> تصفير النقاط
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. Random question
// ---------------------------------------------------------------------------
function RandomQuestion() {
  const [q, setQ] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  function draw() {
    setQ(pickRandom(RANDOM_QUESTIONS));
    setCount((c) => c + 1);
  }
  return (
    <div className="mt-4">
      <div className="flex min-h-28 items-center justify-center rounded-2xl bg-[#F5F7FB] p-6 text-center">
        <p className="text-lg font-extrabold leading-relaxed">{q ?? "دوس على الزرار وهيطلعلك سؤال نقاش جاهز"}</p>
      </div>
      <button onClick={draw} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98]">
        <Sparkles className="h-4 w-4" /> سؤال عشوائي {count > 0 && `(${count})`}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Team leader picker
// ---------------------------------------------------------------------------
function LeaderPicker({ names }: { names: string[] }) {
  const [leader, setLeader] = useState<string | null>(null);
  const [cycling, setCycling] = useState(false);

  function pick() {
    if (names.length === 0 || cycling) return;
    setCycling(true);
    let ticks = 0;
    const id = window.setInterval(() => {
      setLeader(pickRandom(names));
      ticks += 1;
      if (ticks >= 12) {
        window.clearInterval(id);
        setLeader(pickRandom(names));
        setCycling(false);
      }
    }, 70);
  }

  return (
    <div className="mt-4">
      {names.length === 0 ? (
        <EmptyNames />
      ) : (
        <>
          <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl bg-[#F5F7FB] p-6 text-center">
            <Crown className="h-6 w-6 text-amber-500" />
            <span className="mt-2 text-2xl font-extrabold">{leader ?? "؟"}</span>
            {leader && !cycling && <span className="mt-1 text-sm font-bold text-slate-500">قائد الفريق</span>}
          </div>
          <button
            onClick={pick}
            disabled={cycling}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98] disabled:opacity-70"
          >
            <Crown className="h-4 w-4" /> {cycling ? "بنختار..." : "اختار قائد الفريق"}
          </button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 10. Activity generator
// ---------------------------------------------------------------------------
function ActivityGenerator() {
  const [activity, setActivity] = useState(() => pickRandom(QUICK_ACTIVITIES));
  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-[#7C5CFC]/10 p-5">
        <p className="flex items-center gap-1.5 text-xs font-bold text-[#7C5CFC]">
          <Clock className="h-3.5 w-3.5" /> {activity.timeMinutes} دقائق
        </p>
        <h3 className="mt-2 text-lg font-extrabold leading-snug">{activity.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{activity.description}</p>
      </div>
      <button
        onClick={() => setActivity(pickRandom(QUICK_ACTIVITIES))}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4568FF] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#3a5ae0] active:scale-[0.98]"
      >
        <Wand2 className="h-4 w-4" /> نشاط جديد
      </button>
      <div className="mt-4">
        <p className="text-xs font-bold text-slate-400">كل الأنشطة السريعة ({QUICK_ACTIVITIES.length})</p>
        <div className="mt-2 space-y-2">
          {QUICK_ACTIVITIES.map((a) => (
            <button key={a.id} onClick={() => setActivity(a)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-right transition hover:border-[#4568FF] hover:bg-[#4568FF]/5">
              <span className="text-sm font-extrabold">{a.title}</span>
              <span className="mr-2 text-xs text-slate-400">• {a.timeMinutes} دقائق</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 11. Challenge card
// ---------------------------------------------------------------------------
function ChallengeCard() {
  const [card, setCard] = useState(() => pickRandom(CHALLENGE_CARDS));
  const [flipped, setFlipped] = useState(true);
  function draw() {
    setFlipped(false);
    window.setTimeout(() => {
      setCard(pickRandom(CHALLENGE_CARDS));
      setFlipped(true);
    }, 250);
  }
  return (
    <div className="mt-4">
      <button
        onClick={draw}
        className={`block w-full rounded-3xl bg-gradient-to-bl from-[#101828] to-[#4568FF] p-6 text-white shadow-lg transition-all duration-300 active:scale-[0.98] ${flipped ? "opacity-100" : "scale-95 opacity-40"}`}
      >
        <p className="text-xs font-bold text-white/60">بطاقة تحدي • +{card.xp} نقطة</p>
        <h3 className="mt-2 text-xl font-extrabold leading-snug">{card.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/80">{card.description}</p>
        <p className="mt-4 text-xs font-bold text-white/60">دوس على البطاقة عشان تسحب بطاقة جديدة</p>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {CHALLENGE_CARDS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCard(c)}
            className={`rounded-xl border px-3 py-2.5 text-right text-xs font-bold transition ${
              c.id === card.id ? "border-[#4568FF] bg-[#4568FF]/5 text-[#4568FF]" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 12. Surprise box
// ---------------------------------------------------------------------------
function SurpriseBox() {
  const [open, setOpen] = useState(false);
  const [surprise, setSurprise] = useState(() => pickRandom(SURPRISE_BOX));
  function openBox() {
    if (open) {
      setSurprise(pickRandom(SURPRISE_BOX));
    }
    setOpen(true);
  }
  function reset() {
    setOpen(false);
  }
  return (
    <div className="mt-4 text-center">
      {!open ? (
        <button onClick={openBox} className="mx-auto flex flex-col items-center rounded-3xl bg-[#F5F7FB] p-8 transition hover:bg-[#7C5CFC]/10 active:scale-95">
          <Gift className="h-16 w-16 text-[#7C5CFC]" />
          <span className="mt-3 text-lg font-extrabold">دوس عشان تفتح الصندوق</span>
          <span className="mt-1 text-sm text-slate-500">فيه مفاجأة حلوة للفصل جواه</span>
        </button>
      ) : (
        <div className="rounded-3xl bg-gradient-to-bl from-[#7C5CFC] to-[#4568FF] p-6 text-white shadow-lg">
          <Gift className="mx-auto h-10 w-10" />
          <h3 className="mt-3 text-xl font-extrabold leading-snug">{surprise.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/85">{surprise.description}</p>
          <div className="mt-5 flex gap-2">
            <button onClick={openBox} className="flex-1 rounded-xl bg-white py-3 text-sm font-extrabold text-[#4568FF] transition hover:bg-white/90 active:scale-[0.98]">
              مفاجأة تانية
            </button>
            <button onClick={reset} className="flex-1 rounded-xl bg-white/20 py-3 text-sm font-extrabold text-white transition hover:bg-white/30 active:scale-[0.98]">
              اقفل الصندوق
            </button>
          </div>
        </div>
      )}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Check className="h-3.5 w-3.5 text-green-500" /> {SURPRISE_BOX.length} مفاجآت مختلفة جاهزة للفصل
      </p>
    </div>
  );
}
