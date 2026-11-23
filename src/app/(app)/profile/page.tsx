// EL FASL — Profile (الملف الشخصي)
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Award,
  Check,
  Edit3,
  Flame,
  LifeBuoy,
  Lightbulb,
  MapPin,
  MessageCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { AppShell, Chip, useToast } from "@/lib/community-ui";
import {
  BADGES,
  DEMO_PROFILE,
  GOVERNORATES,
  SEED_HELP,
  SEED_IDEAS,
  SEED_POSTS,
  STAGES,
  SUBJECTS,
  levelForXp,
  nextLevelForXp,
  profileSchema,
  xpProgress,
} from "@/lib/community-data";

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState(DEMO_PROFILE);
  const [editing, setEditing] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(DEMO_PROFILE.subjects);
  const { msg, toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof profileSchema>, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      specialization: profile.specialization,
      stage: profile.stage,
      governorate: profile.governorate,
    },
  });

  const myIdeas = useMemo(() => SEED_IDEAS.filter((i) => i.author === profile.name), [profile.name]);
  const myPosts = useMemo(() => SEED_POSTS.filter((p) => p.authorLabel === profile.name), [profile.name]);
  const myRequests = useMemo(() => SEED_HELP.filter((h) => h.author === profile.name), [profile.name]);
  const level = levelForXp(profile.xp);
  const nextLevel = nextLevelForXp(profile.xp);
  const progress = xpProgress(profile.xp);
  const earnedBadges = BADGES.filter((b) => profile.badges.includes(b.id));

  const toggleSubject = (s: string) =>
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const onSubmit = (data: ProfileFormValues) => {
    if (subjects.length === 0) {
      toast("اختار مادة واحدة على الأقل");
      return;
    }
    setProfile((prev) => ({ ...prev, ...data, subjects }));
    setEditing(false);
    toast("تم حفظ بيانات ملفك الشخصي");
  };

  return (
    <AppShell chrome={false} title="ملفي الشخصي" subtitle="بياناتك، مستواك، شاراتك، ومشاركاتك في المجتمع." active="profile">
      {msg && <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{msg}</div>}

      {/* بطاقة الهوية */}
      <section className="mb-5 overflow-hidden rounded-3xl bg-[#101828] p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#7C5CFC] text-3xl font-black">
            {profile.name.replace("أ. ", "").charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black">{profile.name}</h2>
            <p className="mt-1 text-sm font-semibold text-gray-300">
              {profile.specialization} • {profile.stage}
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-300">
              <MapPin className="h-4 w-4" /> {profile.governorate || "المحافظة غير محددة"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.subjects.map((s) => (
                <Chip key={s} tone="violet">{s}</Chip>
              ))}
            </div>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1 rounded-full bg-white px-4 py-2.5 text-sm font-black text-[#101828] hover:bg-gray-100"
          >
            <Edit3 className="h-4 w-4" /> تعديل البيانات
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-amber-300" /> {level.name} — {profile.xp} نقطة XP
            </span>
            <span className="text-gray-300">
              {nextLevel ? `المستوى الجاي: ${nextLevel.name} (${nextLevel.minXp} نقطة)` : "وصلت أعلى مستوى!"}
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gradient-to-l from-[#4568FF] to-[#7C5CFC] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 flex items-center gap-1 text-sm font-bold text-amber-300">
            <Flame className="h-4 w-4" /> سلسلة الأيام المتتالية: {profile.streak} أيام — كمّل بكرة عشان تحافظ عليها
          </p>
        </div>
      </section>

      {/* تعديل البيانات */}
      {editing && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-5 space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="font-black">تعديل بياناتي</h3>
          <div>
            <input {...register("name")} placeholder="الاسم" className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-4 py-3 text-sm font-semibold outline-none focus:border-[#4568FF]" />
            {errors.name && <p className="mt-1 text-xs font-bold text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <select {...register("specialization")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <select {...register("stage")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <select {...register("governorate")} className="w-full rounded-2xl border border-gray-200 bg-[#F5F7FB] px-3 py-3 text-sm font-semibold outline-none">
                <option value="">المحافظة (اختياري)</option>
                {GOVERNORATES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-black">المواد التي أدرّسها</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={`rounded-full px-3 py-2 text-sm font-bold ${subjects.includes(s) ? "bg-[#4568FF] text-white" : "bg-[#F5F7FB] text-gray-700"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1 rounded-full bg-[#4568FF] px-6 py-3 text-sm font-black text-white">
              <Check className="h-4 w-4" /> حفظ التعديلات
            </button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-full bg-gray-100 px-6 py-3 text-sm font-black text-gray-700">
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* إحصائيات مشاركاتي */}
      <section className="mb-5 grid grid-cols-3 gap-3">
        {[
          { icon: Lightbulb, label: "أفكاري", value: myIdeas.length, color: "bg-amber-500" },
          { icon: MessageCircle, label: "منشوراتي", value: myPosts.length, color: "bg-[#7C5CFC]" },
          { icon: LifeBuoy, label: "طلبات المساعدة", value: myRequests.length, color: "bg-[#4568FF]" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-2xl text-white ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-2 text-2xl font-black">{s.value}</p>
            <p className="text-xs font-bold text-gray-400">{s.label}</p>
          </div>
        ))}
      </section>

      {/* الشارات */}
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-black">
          <Award className="h-5 w-5 text-amber-500" /> شاراتي ({earnedBadges.length} من {BADGES.length})
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {BADGES.map((b) => {
            const earned = profile.badges.includes(b.id);
            return (
              <div key={b.id} className={`rounded-2xl p-4 text-center ${earned ? "bg-amber-50 ring-1 ring-amber-200" : "bg-[#F5F7FB] opacity-50"}`}>
                <Sparkles className={`mx-auto h-7 w-7 ${earned ? "text-amber-500" : "text-gray-300"}`} />
                <p className="mt-2 text-sm font-black">{b.name}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-gray-500">{b.description}</p>
                <p className="mt-1 text-xs font-black text-[#4568FF]">{earned ? "تم الحصول عليها" : `+${b.xp} XP`}</p>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
