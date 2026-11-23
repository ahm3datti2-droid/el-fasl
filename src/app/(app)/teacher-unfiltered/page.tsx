// EL FASL — Teacher Unfiltered (فضفضة مدرس)
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Flag,
  Heart,
  MessageCircle,
  Plus,
  Shield,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";
import { AppShell, Chip, useToast } from "@/lib/community-ui";
import {
  POST_TYPES,
  SEED_POSTS,
  anonymousPostSchema,
  type AnonymousPost,
} from "@/lib/community-data";

type PostFormValues = z.infer<typeof anonymousPostSchema>;

const RULES = [
  "ممنوع التشهير بأي شخص أو مدرسة.",
  "ممنوع نشر أي معلومات شخصية: أسماء طلاب، أرقام هواتف، أو صور بدون إذن.",
  "ممنوع الإساءة أو التنمر أو الألفاظ غير اللائقة.",
  "المنشورات المجهولة تظل مجهولة لكل المستخدمين، والهوية الحقيقية محفوظة للإدارة فقط لأغراض الإشراف.",
  "أي محتوى مخالف يُحذف، وقد يُعطَّل حساب صاحبه.",
];

function PostCard({
  post,
  onLike,
  onVote,
  onReport,
}: {
  post: AnonymousPost & { liked?: boolean; voted?: "for" | "against" | null; reported?: boolean };
  onLike: (id: string) => void;
  onVote: (id: string, v: "for" | "against") => void;
  onReport: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments);

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="violet">{post.type}</Chip>
        <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
          {post.anonymous ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {post.authorLabel}
        </span>
        <span className="text-xs font-bold text-gray-300">{post.createdAt}</span>
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-9 text-gray-800">{post.content}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition ${post.liked ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500"}`}
        >
          <Heart className={`h-4 w-4 ${post.liked ? "fill-red-500" : ""}`} /> {post.likes + (post.liked ? 1 : 0)}
        </button>
        <button
          onClick={() => onVote(post.id, "for")}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition ${post.voted === "for" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600"}`}
        >
          <ThumbsUp className="h-4 w-4" /> حصل معايا ({post.votesFor + (post.voted === "for" ? 1 : 0)})
        </button>
        <button
          onClick={() => onVote(post.id, "against")}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold transition ${post.voted === "against" ? "bg-gray-200 text-gray-800" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
        >
          <ThumbsDown className="h-4 w-4" /> مش معايا ({post.votesAgainst + (post.voted === "against" ? 1 : 0)})
        </button>
        <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1 rounded-full bg-gray-50 px-3 py-2 text-sm font-bold text-gray-600 transition hover:bg-blue-50 hover:text-[#4568FF]">
          <MessageCircle className="h-4 w-4" /> {comments.length} تعليقات
        </button>
        <button
          onClick={() => onReport(post.id)}
          disabled={post.reported}
          className="mr-auto flex items-center gap-1 rounded-full bg-gray-50 px-3 py-2 text-xs font-bold text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
        >
          <Flag className="h-3.5 w-3.5" /> {post.reported ? "تم الإبلاغ" : "إبلاغ"}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2 rounded-2xl bg-[#F5F7FB] p-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-white p-3">
              <p className="text-xs font-black text-[#4568FF]">{c.author} <span className="font-semibold text-gray-400">• {c.createdAt}</span></p>
              <p className="mt-1 text-sm font-semibold leading-7">{c.text}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تعليقك أو نصيحتك..."
              className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-[#4568FF]"
            />
            <button
              onClick={() => {
                if (comment.trim().length < 2) return;
                setComments((prev) => [...prev, { id: `c-${Date.now()}`, author: "أنت", text: comment.trim(), createdAt: "الآن" }]);
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

export default function TeacherUnfilteredPage() {
  const [posts, setPosts] = useState<(AnonymousPost & { liked?: boolean; voted?: "for" | "against" | null; reported?: boolean })[]>(SEED_POSTS);
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [showForm, setShowForm] = useState(false);
  const [authError, setAuthError] = useState(false);
  const { msg, toast } = useToast();

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.posts?.length) setPosts(data.posts);
      })
      .catch(() => undefined);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof anonymousPostSchema>, unknown, PostFormValues>({
    resolver: zodResolver(anonymousPostSchema),
    defaultValues: { anonymous: true },
  });
  const anonymous = watch("anonymous");

  const filtered = typeFilter === "الكل" ? posts : posts.filter((p) => p.type === typeFilter);

  const onSubmit = async (data: PostFormValues) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      if (!res.ok) throw new Error("failed");
      const created = await res.json();
      setPosts((prev) => [created.post, ...prev]);
      toast(data.anonymous ? "تم نشر موقفك كمجهول بنجاح" : "تم نشر موقفك باسمك");
      reset({ type: "فضفضة", content: "", anonymous: true });
      setShowForm(false);
    } catch {
      toast("حصلت مشكلة أثناء النشر، جرّب تاني");
    }
  };

  return (
    <AppShell title="فضفضة مدرس" subtitle="مساحة آمنة تشارك فيها مواقفك من الفصل — باسمك أو كمجهول، من غير أحكام." active="community">
      {msg && <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{msg}</div>}
      {authError && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <span>لازم تسجّل الدخول عشان تنشر. فعّل وضع الضيف التجريبي من الشريط فوق أو سجّل الدخول.</span>
          <button onClick={() => setAuthError(false)} aria-label="إغلاق"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* قواعد المساحة */}
      <section className="mb-6 rounded-3xl border border-[#7C5CFC]/25 bg-violet-50 p-5">
        <h2 className="flex items-center gap-2 font-black text-[#7C5CFC]">
          <Shield className="h-5 w-5" /> قواعد المساحة الآمنة
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm font-semibold leading-7 text-gray-700">
          {RULES.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C5CFC]" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      <button
        onClick={() => setShowForm((v) => !v)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#7C5CFC] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-200 hover:bg-[#6a4de0] md:w-auto"
      >
        <Plus className="h-5 w-5" /> شارك موقفك
      </button>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="font-black">موقف جديد</h3>
          <div>
            <select {...register("type")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
              {POST_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.type && <p className="mt-1 text-xs font-bold text-red-500">{errors.type.message}</p>}
          </div>
          <div>
            <textarea {...register("content")} rows={4} placeholder="احكي الموقف... من غير أسماء طلاب أو أرقام هواتف أو تفاصيل شخصية" className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#7C5CFC]" />
            {errors.content && <p className="mt-1 text-xs font-bold text-red-500">{errors.content.message}</p>}
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#F5F7FB] px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-black">
              {anonymous ? <EyeOff className="h-5 w-5 text-[#7C5CFC]" /> : <Eye className="h-5 w-5 text-[#7C5CFC]" />}
              نشر كمجهول
              <span className="text-xs font-semibold text-gray-400">(اسمك مش هيظهر لأي مستخدم)</span>
            </span>
            <input type="checkbox" {...register("anonymous")} className="h-5 w-5 accent-[#7C5CFC]" />
          </label>
          <button type="submit" className="rounded-full bg-[#7C5CFC] px-6 py-3 text-sm font-black text-white hover:bg-[#6a4de0]">
            نشر الموقف
          </button>
        </form>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {["الكل", ...POST_TYPES].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm ${typeFilter === t ? "bg-[#101828] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={(id) => setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p)))}
            onVote={(id, v) => setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, voted: p.voted === v ? null : v } : p)))}
            onReport={(id) => {
              setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, reported: true } : p)));
              toast("تم إرسال البلاغ للإدارة للمراجعة");
            }}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-3xl bg-white p-10 text-center font-bold text-gray-400 shadow-sm">لا توجد منشورات في هذا النوع بعد.</p>
      )}
    </AppShell>
  );
}
