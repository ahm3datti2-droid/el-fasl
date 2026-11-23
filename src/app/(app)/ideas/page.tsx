// EL FASL — Idea Factory (مصنع الأفكار)
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bookmark,
  Clock,
  Flag,
  Heart,
  Lightbulb,
  MessageCircle,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { AppShell, Chip, useToast } from "@/lib/community-ui";
import {
  SEED_IDEAS,
  STAGES,
  SUBJECTS,
  ideaSchema,
  type Idea,
} from "@/lib/community-data";

type IdeaFormValues = z.infer<typeof ideaSchema>;

function IdeaCard({
  idea,
  onLike,
  onBookmark,
  onReport,
}: {
  idea: Idea & { liked?: boolean; bookmarked?: boolean; reported?: boolean };
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onReport: (id: string) => void;
}) {
  const [showSteps, setShowSteps] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [shared, setShared] = useState(false);

  const share = async () => {
    const text = `${idea.title} — ${idea.description}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: idea.title, text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      // user cancelled the share sheet — nothing to do
    }
  };

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="blue">{idea.subject}</Chip>
        <Chip tone="violet">{idea.stage}</Chip>
        <Chip>
          <Clock className="h-3.5 w-3.5" /> {idea.timeMinutes} دقائق
        </Chip>
        {idea.timeMinutes < 5 && <Chip tone="green">فكرة سريعة ⚡</Chip>}
      </div>
      <h3 className="mt-3 text-lg font-black leading-8">{idea.title}</h3>
      <p className="mt-2 text-sm font-semibold leading-8 text-gray-600">{idea.description}</p>
      <p className="mt-2 text-xs font-bold text-gray-400">
        {idea.author} • {idea.createdAt}
        {idea.tools ? ` • الأدوات: ${idea.tools}` : ""}
      </p>

      <button onClick={() => setShowSteps((v) => !v)} className="mt-3 text-sm font-black text-[#4568FF] hover:underline">
        {showSteps ? "إخفاء خطوات التنفيذ" : "عرض خطوات التنفيذ"}
      </button>
      {showSteps && (
        <ol className="mt-2 space-y-2 rounded-2xl bg-[#F5F7FB] p-4 text-sm font-semibold leading-7 text-gray-700">
          {idea.steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4568FF] text-xs font-black text-white">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        <button
          onClick={() => onLike(idea.id)}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition ${idea.liked ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500"}`}
        >
          <Heart className={`h-4 w-4 ${idea.liked ? "fill-red-500" : ""}`} /> {idea.likes + (idea.liked ? 1 : 0)}
        </button>
        <button
          onClick={() => onBookmark(idea.id)}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition ${idea.bookmarked ? "bg-violet-50 text-[#7C5CFC]" : "bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-[#7C5CFC]"}`}
        >
          <Bookmark className={`h-4 w-4 ${idea.bookmarked ? "fill-[#7C5CFC]" : ""}`} /> {idea.bookmarked ? "محفوظة" : "حفظ"}
        </button>
        <button onClick={share} className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-blue-50 hover:text-[#4568FF]">
          <Share2 className="h-4 w-4" /> {shared ? "تمت المشاركة ✓" : "مشاركة"}
        </button>
        <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-blue-50 hover:text-[#4568FF]">
          <MessageCircle className="h-4 w-4" /> {idea.commentsCount + comments.length}
        </button>
        <button
          onClick={() => onReport(idea.id)}
          disabled={idea.reported}
          className="mr-auto flex items-center gap-1 rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
        >
          <Flag className="h-3.5 w-3.5" /> {idea.reported ? "تم الإبلاغ" : "إبلاغ"}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 rounded-2xl bg-[#F5F7FB] p-3">
          {comments.map((c, i) => (
            <p key={i} className="mb-2 rounded-xl bg-white p-3 text-sm font-semibold">أنت: {c}</p>
          ))}
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تعليقك..."
              className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-[#4568FF]"
            />
            <button
              onClick={() => {
                if (comment.trim().length < 2) return;
                setComments((prev) => [...prev, comment.trim()]);
                setComment("");
              }}
              className="rounded-full bg-[#4568FF] px-4 py-2 text-sm font-black text-white"
            >
              نشر
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<(Idea & { liked?: boolean; bookmarked?: boolean; reported?: boolean })[]>(SEED_IDEAS);
  const [subject, setSubject] = useState("الكل");
  const [stage, setStage] = useState("الكل");
  const [quickOnly, setQuickOnly] = useState(false);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [authError, setAuthError] = useState(false);
  const { msg, toast } = useToast();

  useEffect(() => {
    fetch("/api/ideas")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.ideas?.length) setIdeas(data.ideas);
      })
      .catch(() => undefined);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof ideaSchema>, unknown, IdeaFormValues>({ resolver: zodResolver(ideaSchema) });

  const ideaOfDay = useMemo(() => ideas.find((i) => i.isIdeaOfDay) ?? ideas[0], [ideas]);
  const mostLiked = useMemo(() => [...ideas].sort((a, b) => b.likes - a.likes).slice(0, 3), [ideas]);

  const filtered = ideas.filter((i) => {
    if (subject !== "الكل" && i.subject !== subject) return false;
    if (stage !== "الكل" && i.stage !== stage) return false;
    if (quickOnly && i.timeMinutes >= 5) return false;
    if (bookmarksOnly && !i.bookmarked) return false;
    if (query && !`${i.title} ${i.description}`.includes(query)) return false;
    return true;
  });

  const toggle = (id: string, key: "liked" | "bookmarked" | "reported") =>
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, [key]: !i[key] } : i)));

  const onSubmit = async (data: IdeaFormValues) => {
    const steps = data.steps.split("\n").map((s) => s.trim()).filter(Boolean);
    const payload = { ...data, steps: steps.join("\n") };
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      if (!res.ok) throw new Error("failed");
      const created = await res.json();
      setIdeas((prev) => [created.idea, ...prev]);
      toast("تم نشر فكرتك! +20 نقطة XP");
      reset();
      setShowForm(false);
    } catch {
      toast("حصلت مشكلة أثناء النشر، جرّب تاني");
    }
  };

  return (
    <AppShell title="مصنع الأفكار" subtitle="أفكار تربوية صغيرة وعملية من مدرسين زيك — جرّبها في حصتك بكرة." active="community">
      {msg && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{msg}</div>
      )}
      {authError && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <span>لازم تسجّل الدخول عشان تنشر فكرة. فعّل وضع الضيف التجريبي من الشريط فوق أو سجّل الدخول.</span>
          <button onClick={() => setAuthError(false)} aria-label="إغلاق"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* فكرة اليوم */}
      {ideaOfDay && (
        <section className="mb-6 overflow-hidden rounded-3xl bg-[#101828] p-5 text-white shadow-lg md:p-6">
          <div className="flex items-center gap-2 text-sm font-black text-amber-300">
            <Sparkles className="h-5 w-5" /> فكرة اليوم
          </div>
          <h2 className="mt-2 text-xl font-black leading-9 md:text-2xl">{ideaOfDay.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-8 text-gray-300">{ideaOfDay.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip tone="blue">{ideaOfDay.subject}</Chip>
            <Chip tone="violet">{ideaOfDay.stage}</Chip>
            <Chip>{ideaOfDay.timeMinutes} دقائق</Chip>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">
              <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" /> {ideaOfDay.likes}
            </span>
          </div>
        </section>
      )}

      {/* الأكثر إعجابًا */}
      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black">
          <Star className="h-5 w-5 text-amber-500" /> الأفكار الأكثر إعجابًا
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {mostLiked.map((idea, i) => (
            <button
              key={idea.id}
              onClick={() => {
                setSubject("الكل");
                setStage("الكل");
                setQuickOnly(false);
                setQuery(idea.title.slice(0, 8));
              }}
              className="rounded-3xl bg-white p-4 text-right shadow-sm transition hover:shadow-md"
            >
              <span className="text-2xl font-black text-[#7C5CFC]">#{i + 1}</span>
              <p className="mt-1 font-black leading-7">{idea.title}</p>
              <p className="mt-1 text-xs font-bold text-gray-400">{idea.subject} • {idea.likes} إعجاب</p>
            </button>
          ))}
        </div>
      </section>

      {/* إضافة فكرة */}
      <button
        onClick={() => setShowForm((v) => !v)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#4568FF] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 hover:bg-[#3556e0] md:w-auto"
      >
        <Plus className="h-5 w-5" /> شارك فكرتك مع المجتمع
      </button>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-black">
            <Lightbulb className="h-5 w-5 text-amber-500" /> فكرة جديدة
          </h3>
          <div>
            <input {...register("title")} placeholder="عنوان الفكرة" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
            {errors.title && <p className="mt-1 text-xs font-bold text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <textarea {...register("description")} rows={3} placeholder="وصف الفكرة..." className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
            {errors.description && <p className="mt-1 text-xs font-bold text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <select {...register("subject")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                <option value="">المادة</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="mt-1 text-xs font-bold text-red-500">{errors.subject.message}</p>}
            </div>
            <div>
              <select {...register("stage")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                <option value="">المرحلة</option>
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.stage && <p className="mt-1 text-xs font-bold text-red-500">{errors.stage.message}</p>}
            </div>
            <div>
              <input {...register("timeMinutes")} type="number" min={1} max={180} placeholder="الوقت (دقائق)" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none" />
              {errors.timeMinutes && <p className="mt-1 text-xs font-bold text-red-500">{errors.timeMinutes.message}</p>}
            </div>
            <div>
              <input {...register("tools")} placeholder="الأدوات المطلوبة" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none" />
            </div>
          </div>
          <div>
            <textarea {...register("steps")} rows={3} placeholder="خطوات التنفيذ — اكتب كل خطوة في سطر لوحدها" className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
            {errors.steps && <p className="mt-1 text-xs font-bold text-red-500">{errors.steps.message}</p>}
          </div>
          <button type="submit" className="rounded-full bg-[#7C5CFC] px-6 py-3 text-sm font-black text-white hover:bg-[#6a4de0]">
            نشر الفكرة
          </button>
        </form>
      )}

      {/* فلاتر */}
      <div className="mb-5 space-y-3 rounded-3xl bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث في الأفكار..." className="w-full rounded-full border border-gray-200 bg-[#F5F7FB] py-2.5 pl-4 pr-10 text-sm font-semibold outline-none focus:border-[#4568FF]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-full border border-gray-200 bg-[#F5F7FB] px-3 py-2 text-sm font-bold outline-none">
            <option>الكل</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="rounded-full border border-gray-200 bg-[#F5F7FB] px-3 py-2 text-sm font-bold outline-none">
            <option>الكل</option>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => setQuickOnly((v) => !v)} className={`rounded-full px-4 py-2 text-sm font-bold ${quickOnly ? "bg-[#101828] text-white" : "bg-[#F5F7FB] text-gray-700"}`}>
            أفكار سريعة (أقل من 5 دقائق)
          </button>
          <button onClick={() => setBookmarksOnly((v) => !v)} className={`rounded-full px-4 py-2 text-sm font-bold ${bookmarksOnly ? "bg-[#7C5CFC] text-white" : "bg-[#F5F7FB] text-gray-700"}`}>
            محفوظاتي
          </button>
        </div>
      </div>

      {/* أحدث الأفكار */}
      <h2 className="mb-3 text-lg font-black">أحدث الأفكار ({filtered.length})</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onLike={(id) => toggle(id, "liked")}
            onBookmark={(id) => toggle(id, "bookmarked")}
            onReport={(id) => {
              toggle(id, "reported");
              toast("تم إرسال البلاغ للإدارة، شكرًا لمساعدتك");
            }}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-3xl bg-white p-10 text-center font-bold text-gray-400 shadow-sm">
          لا توجد أفكار مطابقة — جرّب تغيير الفلاتر أو شارك فكرتك الأولى.
        </p>
      )}
    </AppShell>
  );
}
