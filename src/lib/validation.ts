// EL FASL — zod validation schemas (Arabic messages).
import { z } from "zod";
import { STAGES } from "./data";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "الاسم لازم يكون حرفين على الأقل"),
  email: z.string().trim().email("اكتب بريدًا إلكترونيًا صحيحًا"),
  password: z.string().min(6, "كلمة المرور لازم تكون 6 أحرف على الأقل"),
  specialization: z.string().min(1, "اختار التخصص"),
  stage: z.enum(STAGES, { error: "اختار المرحلة التعليمية" }),
  subject: z.string().min(1, "اختار المادة"),
  governorate: z.string().optional(),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("اكتب بريدًا إلكترونيًا صحيحًا"),
  password: z.string().min(6, "كلمة المرور لازم تكون 6 أحرف على الأقل"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("اكتب بريدًا إلكترونيًا صحيحًا"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "كلمة المرور لازم تكون 6 أحرف على الأقل"),
    confirmPassword: z.string().min(6, "أكد كلمة المرور"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "الاسم لازم يكون حرفين على الأقل"),
  specialization: z.string().min(1, "اختار التخصص"),
  stage: z.enum(STAGES, { error: "اختار المرحلة التعليمية" }),
  subject: z.string().min(1, "اختار المادة"),
  governorate: z.string().optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
