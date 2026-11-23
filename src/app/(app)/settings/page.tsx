// EL FASL — Settings (الإعدادات)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bell,
  Check,
  KeyRound,
  LogOut,
  Moon,
  Shield,
  Sun,
  TriangleAlert,
  User,
} from "lucide-react";
import { AppShell, readDemoRole, setDemoRole, useToast, type DemoRole } from "@/lib/community-ui";
import {
  DEMO_PROFILE,
  GOVERNORATES,
  STAGES,
  SUBJECTS,
  profileSchema,
} from "@/lib/community-data";

type ProfileFormValues = z.infer<typeof profileSchema>;

const NOTIF_OPTIONS = [
  { id: "challenge", label: "تحدي جديد كل يوم", desc: "إشعار صباحي بتحدي اليوم" },
  { id: "reply", label: "ردود على مشاركاتي", desc: "لما حد يرد على فكرة أو منشور أو طلب ليك" },
  { id: "like", label: "تفاعلات على أفكاري", desc: "لما فكرتك توصل لعدد إعجابات مميز" },
  { id: "badge", label: "شارات وترقيات", desc: "لما تكسب شارة أو تترقى مستوى" },
  { id: "help", label: "طلبات مساعدة قريبة من تخصصي", desc: "طلبات جديدة في مادتك ومرحلتك" },
] as const;

export default function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    challenge: true,
    reply: true,
    like: false,
    badge: true,
    help: true,
  });
  const [demoRole, setDemoRoleState] = useState<DemoRole | null>(null);
  const { msg, toast } = useToast();

  useEffect(() => {
    setDemoRoleState(readDemoRole());
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof profileSchema>, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: DEMO_PROFILE.name,
      specialization: DEMO_PROFILE.specialization,
      stage: DEMO_PROFILE.stage,
      governorate: DEMO_PROFILE.governorate,
    },
  });

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `el-fasl-theme=${next ? "dark" : "light"}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    toast(next ? "تم تفعيل الوضع الداكن" : "تم تفعيل الوضع الفاتح");
  };

  const changeDemoRole = (role: DemoRole | null) => {
    setDemoRole(role);
    setDemoRoleState(role);
    toast(role === "admin" ? "تم التبديل لوضع المشرف التجريبي" : role ? "تم التبديل لوضع المستخدم التجريبي" : "تم إيقاف الوضع التجريبي");
    window.location.reload();
  };

  const logout = () => {
    if (!window.confirm("تسجيل الخروج من حسابك؟")) return;
    setDemoRole(null);
    document.cookie = "el-fasl-theme=; path=/; max-age=0; SameSite=Lax";
    window.location.href = "/login";
  };

  return (
    <AppShell chrome={false} title="الإعدادات" subtitle="بياناتك، إشعاراتك، والمظهر — كل حاجة في مكان واحد." active="profile">
      {msg && <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{msg}</div>}

      {/* الملف الشخصي */}
      <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-black">
          <User className="h-5 w-5 text-[#4568FF]" /> بيانات الملف الشخصي
        </h2>
        <form
          onSubmit={handleSubmit(() => toast("تم حفظ بياناتك"))}
          className="mt-4 space-y-3"
        >
          <input {...register("name")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
          {errors.name && <p className="text-xs font-bold text-red-500">{errors.name.message}</p>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select {...register("specialization")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select {...register("stage")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select {...register("governorate")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
              <option value="">المحافظة (اختياري)</option>
              {GOVERNORATES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <button type="submit" className="flex items-center gap-1 rounded-full bg-[#4568FF] px-6 py-3 text-sm font-black text-white hover:bg-[#3556e0]">
            <Check className="h-4 w-4" /> حفظ البيانات
          </button>
        </form>
      </section>

      {/* المظهر */}
      <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-black">
          {dark ? <Moon className="h-5 w-5 text-[#7C5CFC]" /> : <Sun className="h-5 w-5 text-amber-500" />} المظهر
        </h2>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F5F7FB] px-4 py-3">
          <span className="text-sm font-black">الوضع الداكن (اختياري)</span>
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={dark}
            className={`relative h-7 w-12 rounded-full transition ${dark ? "bg-[#4568FF]" : "bg-gray-300"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${dark ? "right-1" : "right-6"}`} />
          </button>
        </div>
      </section>

      {/* الإشعارات */}
      <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-black">
          <Bell className="h-5 w-5 text-[#4568FF]" /> تفضيلات الإشعارات
        </h2>
        <p className="mt-1 text-sm font-semibold text-gray-500">اختار اللي يوصلك بس — الإشعارات هنا هادية ومش مزعجة.</p>
        <div className="mt-3 space-y-2">
          {NOTIF_OPTIONS.map((o) => (
            <label key={o.id} className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#F5F7FB] px-4 py-3">
              <span>
                <span className="block text-sm font-black">{o.label}</span>
                <span className="block text-xs font-semibold text-gray-400">{o.desc}</span>
              </span>
              <input
                type="checkbox"
                checked={prefs[o.id]}
                onChange={() => setPrefs((prev) => ({ ...prev, [o.id]: !prev[o.id] }))}
                className="h-5 w-5 accent-[#4568FF]"
              />
            </label>
          ))}
        </div>
        <button onClick={() => toast("تم حفظ تفضيلات الإشعارات")} className="mt-4 rounded-full bg-[#4568FF] px-6 py-3 text-sm font-black text-white hover:bg-[#3556e0]">
          حفظ التفضيلات
        </button>
      </section>

      {/* الأمان */}
      <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-black">
          <Shield className="h-5 w-5 text-green-600" /> الأمان
        </h2>
        <div className="mt-3 space-y-3">
          <Link href="/forgot-password" className="flex items-center gap-2 rounded-2xl bg-[#F5F7FB] px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-blue-50 hover:text-[#4568FF]">
            <KeyRound className="h-4 w-4" /> تغيير كلمة المرور
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100">
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
          <p className="text-xs font-semibold leading-6 text-gray-400">
            جلساتك محفوظة في كوكيز آمنة، ومفيش أي بيانات حساسة متخزنة في LocalStorage.
          </p>
        </div>
      </section>

      {/* الوضع التجريبي */}
      <section className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-black text-amber-800">الوضع التجريبي (للتطوير فقط)</h2>
        <p className="mt-1 text-sm font-semibold leading-7 text-amber-700">
          الدور الحالي: <strong>{demoRole === "admin" ? "مشرف عام" : demoRole === "moderator" ? "مشرف محتوى" : demoRole === "user" ? "مستخدم" : "غير محدد"}</strong>.
          التبديل هنا بيغيّر كوكي العرض التجريبي اللي السيرفر بيتحقق منه — وبيتحذف نهائيًا عند ربط تسجيل الدخول الحقيقي بـ Supabase.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => changeDemoRole("user")} className={`rounded-full px-4 py-2.5 text-sm font-black ${demoRole === "user" ? "bg-[#101828] text-white" : "bg-white text-gray-700 shadow-sm"}`}>
            مستخدم تجريبي
          </button>
          <button onClick={() => changeDemoRole("admin")} className={`rounded-full px-4 py-2.5 text-sm font-black ${demoRole === "admin" ? "bg-[#101828] text-white" : "bg-white text-gray-700 shadow-sm"}`}>
            مشرف تجريبي (لوحة الإدارة)
          </button>
          <button onClick={() => changeDemoRole(null)} className="rounded-full bg-white px-4 py-2.5 text-sm font-black text-gray-700 shadow-sm">
            إيقاف الوضع التجريبي
          </button>
        </div>
      </section>

      {/* منطقة الخطر */}
      <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
        <h2 className="flex items-center gap-2 font-black text-red-700">
          <TriangleAlert className="h-5 w-5" /> منطقة الخطر
        </h2>
        <p className="mt-2 text-sm font-semibold leading-7 text-red-600">
          حذف الحساب نهائيًا بيمسح كل أفكارك ومنشوراتك وطلباتك ونقاطك، ومش ممكن التراجع عنه.
          لو عايز تحذف حسابك، ابعت طلب من صفحة المساعدة أو تواصل مع الإدارة — الحذف بيتم بعد تأكيد هويتك من الإدارة، مش بضغطة واحدة من هنا، حمايةً لحسابك.
        </p>
      </section>
    </AppShell>
  );
}
