// EL FASL — forgot password page.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { requestPasswordResetAction } from "@/lib/auth";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation";
import { Alert, Button, Card, Field, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>();

  async function onSubmit(values: ForgotPasswordValues) {
    setServerError(null);
    setSuccessMessage(null);
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setServerError("اكتب بريدًا إلكترونيًا صحيحًا");
      return;
    }
    const res = await requestPasswordResetAction(parsed.data);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    setSuccessMessage(res.message ?? "تم إرسال رابط الاستعادة إلى بريدك الإلكتروني.");
  }

  return (
    <Card className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold text-navy dark:text-white">استعادة كلمة المرور</h1>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
        اكتب بريدك الإلكتروني وهنبعت لك رابط لتغيير كلمة المرور.
      </p>

      {serverError && (
        <Alert variant="error" className="mt-5">
          {serverError}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" className="mt-5">
          {successMessage}
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
        <Button type="submit" loading={isSubmitting} className="w-full">
          إرسال رابط الاستعادة
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        افتكرت كلمة المرور؟{" "}
        <Link href="/login" className="font-bold text-electric hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </Card>
  );
}
