// EL FASL — register page.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signUpAction } from "@/lib/auth";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { GOVERNORATES, SPECIALIZATIONS, STAGES, SUBJECTS } from "@/lib/data";
import { Alert, Button, Card, Field, Input, Select } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const demoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>();

  async function onSubmit(values: RegisterValues) {
    setServerError(null);
    setSuccessMessage(null);
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setServerError("تأكد من بيانات التسجيل");
      return;
    }
    const res = await signUpAction(parsed.data);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    if (res.message) {
      setSuccessMessage(res.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold text-navy dark:text-white">إنشاء حساب جديد</h1>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
        انضم لمجتمع المدرسين وابدأ تحدي النهارده.
      </p>

      {demoMode && (
        <Alert variant="warning" className="mt-5">
          وضع تجريبي — أي بيانات تسجيل تعمل فورًا بدون تأكيد بريد.
        </Alert>
      )}
      {serverError && (
        <Alert variant="error" className="mt-5">
          {serverError}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" className="mt-5">
          {successMessage}{" "}
          <Link href="/login" className="font-bold underline">
            تسجيل الدخول
          </Link>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Field label="الاسم" error={errors.name?.message}>
          <Input
            type="text"
            placeholder="مثال: أحمد محمد"
            autoComplete="name"
            {...register("name", { required: "اكتب اسمك" })}
          />
        </Field>
        <Field label="البريد الإلكتروني" error={errors.email?.message}>
          <Input
            type="email"
            dir="ltr"
            placeholder="name@example.com"
            autoComplete="email"
            {...register("email", { required: "اكتب بريدك الإلكتروني" })}
          />
        </Field>
        <Field label="كلمة المرور" error={errors.password?.message} hint="6 أحرف على الأقل">
          <Input
            type="password"
            dir="ltr"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password", { required: "اكتب كلمة المرور" })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="التخصص" error={errors.specialization?.message}>
            <Select
              defaultValue=""
              {...register("specialization", { required: "اختار التخصص" })}
            >
              <option value="" disabled>
                اختار التخصص
              </option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="المرحلة التعليمية" error={errors.stage?.message}>
            <Select defaultValue="" {...register("stage", { required: "اختار المرحلة" })}>
              <option value="" disabled>
                اختار المرحلة
              </option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المادة" error={errors.subject?.message}>
            <Select defaultValue="" {...register("subject", { required: "اختار المادة" })}>
              <option value="" disabled>
                اختار المادة
              </option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="المحافظة (اختياري)" error={errors.governorate?.message}>
            <Select defaultValue="" {...register("governorate")}>
              <option value="">بدون تحديد</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          إنشاء الحساب
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        عندك حساب بالفعل؟{" "}
        <Link href="/login" className="font-bold text-electric hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </Card>
  );
}
