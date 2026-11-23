// EL FASL — reset password page (reached from the email link via /auth/callback).
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { resetPasswordAction } from "@/lib/auth";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation";
import { Alert, Button, Card, Field, Input } from "@/components/ui";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
  const params = use(searchParams);
  const [serverError, setServerError] = useState<string | null>(
    params.error ? "انتهت صلاحية رابط الاستعادة، اطلب رابطًا جديدًا." : null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>();

  async function onSubmit(values: ResetPasswordValues) {
    setServerError(null);
    setSuccessMessage(null);
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? "تأكد من كلمة المرور الجديدة");
      return;
    }
    const res = await resetPasswordAction(parsed.data);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    setSuccessMessage(res.message ?? "تم تغيير كلمة المرور بنجاح.");
  }

  return (
    <Card className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold text-navy dark:text-white">كلمة مرور جديدة</h1>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
        اختار كلمة مرور قوية (6 أحرف على الأقل).
      </p>

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
        <Field label="كلمة المرور الجديدة" error={errors.password?.message}>
          <Input
            type="password"
            dir="ltr"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password", { required: "اكتب كلمة المرور الجديدة" })}
          />
        </Field>
        <Field label="تأكيد كلمة المرور" error={errors.confirmPassword?.message}>
          <Input
            type="password"
            dir="ltr"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword", { required: "أكد كلمة المرور" })}
          />
        </Field>
        <Button type="submit" loading={isSubmitting} className="w-full">
          تغيير كلمة المرور
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        <Link href="/forgot-password" className="font-bold text-electric hover:underline">
          طلب رابط استعادة جديد
        </Link>
      </p>
    </Card>
  );
}
