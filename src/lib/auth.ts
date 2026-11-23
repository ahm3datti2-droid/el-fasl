// EL FASL — auth Server Actions + server-side session reader.
// Supabase Auth (email/password) when env vars are set; DEMO MODE otherwise:
// any email + password >= 6 chars signs in and sets an httpOnly demo cookie.
// No password or token is ever stored in localStorage.
"use server";

import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/client";
import {
  DEMO_COOKIE,
  demoRoleForEmail,
  demoSessionToUser,
  encodeDemoSession,
  parseDemoSession,
  type DemoSession,
} from "./demo";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./validation";
import type { SessionUser, UserRole } from "./data";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function setDemoCookie(session: DemoSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, encodeDemoSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function signInAction(values: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "تأكد من البريد الإلكتروني وكلمة المرور" };
  const { email, password } = parsed.data;

  if (!isSupabaseConfigured()) {
    const name = email.split("@")[0] || "مدرس";
    await setDemoCookie({ name, email, role: demoRoleForEmail(email) });
    return { ok: true };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "خدمة تسجيل الدخول غير متاحة حاليًا" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  return { ok: true };
}

export async function signUpAction(values: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "تأكد من بيانات التسجيل" };
  const { name, email, password, specialization, stage, subject, governorate } = parsed.data;

  if (!isSupabaseConfigured()) {
    await setDemoCookie({ name, email, role: demoRoleForEmail(email) });
    return { ok: true };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "خدمة إنشاء الحساب غير متاحة حاليًا" };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, specialization, stage, subject, governorate: governorate ?? null },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });
  if (error) {
    if (error.message.includes("already registered")) {
      return { ok: false, error: "هذا البريد مسجل بالفعل، جرّب تسجيل الدخول" };
    }
    return { ok: false, error: "تعذر إنشاء الحساب، حاول مرة أخرى" };
  }

  // If email confirmation is on, there is no session yet: the DB trigger
  // (handle_new_user in supabase/schema.sql) creates the profile row on signup.
  if (data.session && data.user) {
    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email,
        full_name: name,
        specialization,
        stage,
        subject,
        governorate: governorate ?? null,
      },
      { onConflict: "id" },
    );
    return { ok: true };
  }
  return {
    ok: true,
    message: "تم إنشاء حسابك! تحقق من بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.",
  };
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
  return { ok: true };
}

export async function requestPasswordResetAction(values: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "اكتب بريدًا إلكترونيًا صحيحًا" };
  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message: "أنت في الوضع التجريبي — استعادة كلمة المرور تعمل بعد ربط Supabase.",
    };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "الخدمة غير متاحة حاليًا" };
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/reset-password`,
  });
  if (error) return { ok: false, error: "تعذر إرسال رابط الاستعادة، حاول مرة أخرى" };
  return { ok: true, message: "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني." };
}

export async function resetPasswordAction(values: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "تأكد من كلمة المرور الجديدة" };
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "تغيير كلمة المرور غير متاح في الوضع التجريبي" };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "الخدمة غير متاحة حاليًا" };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: "انتهت صلاحية الرابط، اطلب رابطًا جديدًا" };
  return { ok: true, message: "تم تغيير كلمة المرور بنجاح، سجّل الدخول الآن." };
}

/** Server-side session reader: Supabase user first, demo cookie fallback. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, specialization, stage, subject, governorate, xp, role")
          .eq("id", user.id)
          .maybeSingle();
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        const role = (profile?.role as UserRole | undefined) ?? "user";
        return {
          id: user.id,
          email: user.email ?? "",
          name:
            (profile?.full_name as string | undefined) ??
            (meta.full_name as string | undefined) ??
            (user.email ? user.email.split("@")[0] : "مدرس"),
          role,
          specialization:
            (profile?.specialization as string | undefined) ??
            (meta.specialization as string | undefined) ??
            null,
          stage:
            (profile?.stage as string | undefined) ??
            (meta.stage as string | undefined) ??
            null,
          subject:
            (profile?.subject as string | undefined) ??
            (meta.subject as string | undefined) ??
            null,
          governorate:
            (profile?.governorate as string | undefined) ??
            (meta.governorate as string | undefined) ??
            null,
          xp: typeof profile?.xp === "number" ? profile.xp : 0,
          demo: false,
        };
      }
    }
  }

  const demo = parseDemoSession(cookieStore.get(DEMO_COOKIE)?.value);
  if (demo) return demoSessionToUser(demo);
  return null;
}
