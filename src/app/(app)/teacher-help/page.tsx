// EL FASL — Teacher Help Network (مدرس يساعد مدرس)
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  Clock,
  HelpCircle,
  LifeBuoy,
  Plus,
  Send,
  ThumbsUp,
  X,
} from "lucide-react";
import { AppShell, Chip, useToast } from "@/lib/community-ui";
import {
  HELP_STATUSES,
  HELP_TYPES,
  SEED_HELP,
  STAGES,
  SUBJECTS,
  helpRequestSchema,
  type HelpRequest,
} from "@/lib/community-data";

type HelpFormValues = z.infer<typeof helpRequestSchema>;

const STATUS_TONE: Record<string, "green" | "amber" | "blue"> = {
  "تم الحل": "green",
  "مفتوح": "amber",
  "جاري المساعدة": "blue",
};

function HelpCard({
  req,
  onRespond,
  onMarkSolved,
  onHelpful,
}: {
  req: HelpRequest;
  onRespond: (id: string, text: string) => void;
  onMarkSolved: (id: string) => void;
  onHelpful: (reqId: string, resId: string) => void;
}) {
  const [reply, setReply] = useState("");
  const [showReply, setShowReply] = useState(false);
  const unanswered = req.responses.length === 0;

  return (
    <article className={`rounded-3xl bg-white p-5 shadow-sm ${unanswered ? "ring-2 ring-amber-300" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="blue">{req.type}</Chip>
        <Chip tone={STATUS_TONE[req.status]}>{req.status}</Chip>
        {unanswered && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
            <Clock className="h-3.5 w-3.5" /> بانتظار أول رد — ساعد زميلك
          </span>
        )}
      </div>
      <h3 className="mt-3 text-lg font-black leading-8">{req.title}</h3>
      <p className="mt-2 text-sm font-semibold leading-8 text-gray-600">{req.description}</p>
      <p className="mt-2 text-xs font-bold text-gray-400">
        {req.author} • {req.specialization} • {req.stage} • {req.createdAt}
      </p>

      <div className="mt-4 space-y-2">
        {req.responses.map((r) => (
          <div key={r.id} className="rounded-2xl bg-[#F5F7FB] p-3">
            <p className="text-xs font-black text-[#4568FF]">
              {r.author} <span className="font-semibold text-gray-400">• {r.createdAt}</span>
            </p>
            <p className="mt-1 text-sm font-semibold leading-7">{r.text}</p>
            <button onClick={() => onHelpful(req.id, r.id)} className="mt-2 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm transition hover:text-[#4568FF]">
              <ThumbsUp className="h-3.5 w-3.5" /> مفيد ({r.helpful})
            </button>
          </div>
        ))}
        {req.responses.length === 0 && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            لسه مفيش ردود على الطلب ده — لو عندك خبرة في الموضوع، ردك ممكن يفرق جدًا.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {req.status !== "تم الحل" && (
          <>
            <button onClick={() => setShowReply((v) => !v)} className="flex items-center gap-1 rounded-full bg-[#4568FF] px-4 py-2.5 text-sm font-black text-white hover:bg-[#3556e0]">
              <Send className="h-4 w-4" /> ساعد بالرد
            </button>
            <button
              onClick={() => {
                if (window.confirm("تأكيد إن الطلب ده اتحل؟")) onMarkSolved(req.id);
              }}
              className="flex items-center gap-1 rounded-full bg-green-50 px-4 py-2.5 text-sm font-black text-green-700 hover:bg-green-100"
            >
              <Check className="h-4 w-4" /> تم الحل
            </button>
          </>
        )}
        {req.status === "تم الحل" && (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-4 py-2.5 text-sm font-black text-green-700">
            <Check className="h-4 w-4" /> تم حل الطلب بمساعدة المجتمع
          </span>
        )}
      </div>

      {showReply && req.status !== "تم الحل" && (
        <div className="mt-3 flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="اكتب ردك أو نصيحتك..."
            className="flex-1 rounded-full border border-gray-200 bg-[#F5F7FB] px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#4568FF]"
          />
          <button
            onClick={() => {
              if (reply.trim().length < 10) return;
              onRespond(req.id, reply.trim());
              setReply("");
              setShowReply(false);
            }}
            className="rounded-full bg-[#7C5CFC] px-4 py-2.5 text-sm font-black text-white"
          >
            إرسال
          </button>
        </div>
      )}
    </article>
  );
}

export default function TeacherHelpPage() {
  const [requests, setRequests] = useState<HelpRequest[]>(SEED_HELP);
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [authError, setAuthError] = useState(false);
  const { msg, toast } = useToast();

  useEffect(() => {
    fetch("/api/help")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.requests?.length) setRequests(data.requests);
      })
      .catch(() => undefined);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HelpFormValues>({ resolver: zodResolver(helpRequestSchema) });

  const unansweredCount = requests.filter((r) => r.responses.length === 0 && r.status !== "تم الحل").length;

  const filtered = requests.filter((r) => {
    if (typeFilter !== "الكل" && r.type !== typeFilter) return false;
    if (statusFilter !== "الكل" && r.status !== statusFilter) return false;
    if (unansweredOnly && r.responses.length > 0) return false;
    return true;
  });

  const onSubmit = async (data: HelpFormValues) => {
    try {
      const res = await fetch("/api/help", {
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
      setRequests((prev) => [created.request, ...prev]);
      toast("تم نشر طلبك، والمجتمع هيساعدك");
      reset();
      setShowForm(false);
    } catch {
      toast("حصلت مشكلة أثناء النشر، جرّب تاني");
    }
  };

  return (
    <AppShell chrome={false} title="مدرس يساعد مدرس" subtitle="محتاج فكرة شرح أو حل مشكلة؟ اسأل المجتمع — وفيه مدرسين مستعدين يساعدوك." active="community">
      {msg && <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{msg}</div>}
      {authError && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <span>لازم تسجّل الدخول عشان تنشر طلب مساعدة. فعّل وضع الضيف التجريبي من الشريط فوق أو سجّل الدخول.</span>
          <button onClick={() => setAuthError(false)} aria-label="إغلاق"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-3xl bg-[#101828] p-4 text-white shadow-lg">
        <LifeBuoy className="h-8 w-8 text-amber-300" />
        <div className="flex-1">
          <p className="font-black">في {unansweredCount} طلبات لسه من غير ردود</p>
          <p className="text-sm font-semibold text-gray-300">رد واحد منك ممكن يحل مشكلة مدرس زميلك — وتكسب 15 نقطة XP.</p>
        </div>
        <button onClick={() => setUnansweredOnly((v) => !v)} className={`rounded-full px-4 py-2.5 text-sm font-black ${unansweredOnly ? "bg-amber-400 text-[#101828]" : "bg-white text-[#101828]"}`}>
          عرض الطلبات بدون ردود
        </button>
      </div>

      <button
        onClick={() => setShowForm((v) => !v)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#4568FF] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 hover:bg-[#3556e0] md:w-auto"
      >
        <Plus className="h-5 w-5" /> اطلب مساعدة
      </button>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-black">
            <HelpCircle className="h-5 w-5 text-[#4568FF]" /> طلب مساعدة جديد
          </h3>
          <div>
            <input {...register("title")} placeholder="عنوان الطلب" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
            {errors.title && <p className="mt-1 text-xs font-bold text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <textarea {...register("description")} rows={3} placeholder="اشرح مشكلتك أو احتياجك بالتفصيل..." className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
            {errors.description && <p className="mt-1 text-xs font-bold text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <select {...register("type")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                <option value="">نوع الطلب</option>
                {HELP_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              {errors.type && <p className="mt-1 text-xs font-bold text-red-500">{errors.type.message}</p>}
            </div>
            <div>
              <select {...register("specialization")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                <option value="">التخصص</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.specialization && <p className="mt-1 text-xs font-bold text-red-500">{errors.specialization.message}</p>}
            </div>
            <div>
              <select {...register("stage")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                <option value="">المرحلة</option>
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.stage && <p className="mt-1 text-xs font-bold text-red-500">{errors.stage.message}</p>}
            </div>
          </div>
          <button type="submit" className="rounded-full bg-[#7C5CFC] px-6 py-3 text-sm font-black text-white hover:bg-[#6a4de0]">
            نشر الطلب
          </button>
        </form>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-bold shadow-sm outline-none">
          <option>الكل</option>
          {HELP_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        {["الكل", ...HELP_STATUSES].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm ${statusFilter === s ? "bg-[#101828] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((req) => (
          <HelpCard
            key={req.id}
            req={req}
            onRespond={(id, text) => {
              setRequests((prev) =>
                prev.map((r) =>
                  r.id === id
                    ? { ...r, status: r.status === "مفتوح" ? "جاري المساعدة" : r.status, responses: [...r.responses, { id: `hr-${Date.now()}`, author: "أنت", text, createdAt: "الآن", helpful: 0 }] }
                    : r,
                ),
              );
              toast("تم إرسال ردك! +15 نقطة XP");
            }}
            onMarkSolved={(id) => {
              setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "تم الحل" } : r)));
              toast("مبروك! الطلب اتحل");
            }}
            onHelpful={(reqId, resId) => {
              setRequests((prev) =>
                prev.map((r) =>
                  r.id === reqId ? { ...r, responses: r.responses.map((x) => (x.id === resId ? { ...x, helpful: x.helpful + 1 } : x)) } : r,
                ),
              );
            }}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-3xl bg-white p-10 text-center font-bold text-gray-400 shadow-sm">لا توجد طلبات مطابقة للفلاتر.</p>
      )}
    </AppShell>
  );
}
