// EL FASL — shared types + constants only.
// Feature seed data lives with each feature (other agents own theirs).

export type UserRole = "user" | "moderator" | "admin";

export const STAGES = ["ابتدائي", "إعدادي", "ثانوي", "رياض أطفال"] as const;
export type Stage = (typeof STAGES)[number];

export const SUBJECTS = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "الرياضيات",
  "العلوم",
  "الدراسات الاجتماعية",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "التاريخ",
  "الجغرافيا",
  "الفلسفة والمنطق",
  "التربية الدينية",
  "الحاسب الآلي",
  "اللغة الفرنسية",
  "اللغة الألمانية",
  "التربية الفنية",
  "التربية الرياضية",
] as const;

export const SPECIALIZATIONS = [
  "لغة عربية",
  "لغة إنجليزية",
  "رياضيات",
  "علوم",
  "دراسات اجتماعية",
  "فيزياء",
  "كيمياء",
  "أحياء",
  "تاريخ",
  "جغرافيا",
  "فلسفة",
  "حاسب آلي",
  "لغات أجنبية",
  "تربية فنية",
  "تربية رياضية",
  "تربية دينية",
] as const;

export const GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "القليوبية",
  "الإسكندرية",
  "البحيرة",
  "مطروح",
  "الدقهلية",
  "الشرقية",
  "الغربية",
  "كفر الشيخ",
  "المنوفية",
  "دمياط",
  "بورسعيد",
  "الإسماعيلية",
  "السويس",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "البحر الأحمر",
  "الوادي الجديد",
  "شمال سيناء",
  "جنوب سيناء",
] as const;

export interface Level {
  name: string;
  minXp: number;
  description: string;
}

export const LEVELS: Level[] = [
  { name: "مدرس جديد", minXp: 0, description: "بداية الرحلة في الفصل" },
  { name: "مدرس نشيط", minXp: 100, description: "تتفاعل بانتظام مع المجتمع" },
  { name: "مدرس مبدع", minXp: 300, description: "أفكارك بدأت تلهِم غيرك" },
  { name: "خبير الفصل", minXp: 700, description: "خبرة تربوية يعتمد عليها" },
  { name: "أسطورة التدريس", minXp: 1500, description: "قمة التميز في الفصل" },
];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  specialization: string | null;
  stage: string | null;
  subject: string | null;
  governorate: string | null;
  xp: number;
  demo: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  specialization: string | null;
  stage: string | null;
  subject: string | null;
  governorate: string | null;
  avatar_url: string | null;
  xp: number;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ActivityIcon = "idea" | "challenge" | "help" | "badge" | "comment";

export interface ActivityItem {
  id: string;
  name: string;
  action: string;
  time: string;
  icon: ActivityIcon;
}
