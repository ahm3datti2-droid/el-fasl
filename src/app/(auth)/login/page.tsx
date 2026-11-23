// EL FASL — login page.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { signInAction } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { Alert, Button, Card, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [serverError, setServerError] = useState<string | null>(
    searchParams.get("error") === "confirm_failed"
      ? "تعذر تأكيد البريد الإلكتروني، حاول مرة أخرى"
      : null,
  );
  const demoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>();

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setServerError("تأكد من البريد الإلكتروني وكلمة المرور");
      return;
    }
    const res = await signInAction(parsed.data);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <Card className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold text-navy dark:text-white">أهلاً بعودتك</h1>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
        سجّل الدخول عشان تكمل تحدي النهارده.
      </p>

      {demoMode && (
        <Alert variant="warning" className="mt-5">
          وضع تجريبي — ادخل بأي بريد وكلمة مرور (6 أحرف فأكثر). جرّب{" "}
          <span dir="ltr">admin@elfasl.app</span> لدخول لوحة الإدارة.
        </Alert>
      )}
      {serverError && (
        <Alert variant="error" className="mt-5">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Field label="البريد الإلكتروني" error={errors.email?.message}>
          <Input
            type="email"
            dir="ltr"
            placeholder="name@example.com"
            autoComplete="email"
            {...register("email", { required: "اكتب بريدك الإلكتروني" })}
          />
        </Field>
        <Field label="كلمة المرور" error={errors.password?.message}>
          <Input
            type="password"
            dir="ltr"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password", { required: "اكتب كلمة المرور" })}
          />
        </Field>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-electric hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          تسجيل الدخول
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        لسه معندكش حساب؟{" "}
        <Link href="/register" className="font-bold text-electric hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
    </Card>
  );
}
