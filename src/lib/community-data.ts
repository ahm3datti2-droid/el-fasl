// EL FASL — Community & Admin seed data, types, zod schemas and gamification helpers.
// Phase 3 (Community + Admin). Self-contained: no imports from other agents' files.
// Seed data is clearly-marked demo content until Supabase tables are wired in.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SUBJECTS = [
  "اللغة العربية",
  "الرياضيات",
  "العلوم",
  "اللغة الإنجليزية",
  "الدراسات الاجتماعية",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "التربية الدينية",
  "الحاسب الآلي",
  "التربية الفنية",
  "التربية الرياضية",
] as const;

export const STAGES = ["ابتدائي", "إعدادي", "ثانوي", "جامعي"] as const;

export const GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الإسماعيلية",
  "الشرقية",
  "الدقهلية",
  "الغربية",
  "المنوفية",
  "القليوبية",
  "بورسعيد",
  "السويس",
  "الفيوم",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
] as const;

export const POST_TYPES = [
  "موقف مضحك",
  "موقف صعب",
  "مشكلة داخل الفصل",
  "تجربة شخصية",
  "فضفضة",
  "طلب رأي",
] as const;

export const HELP_TYPES = [
  "محتاج فكرة شرح",
  "محتاج نشاط",
  "محتاج حل مشكلة",
  "محتاج نموذج امتحان",
  "محتاج نصيحة",
  "محتاج تجربة مدرس آخر",
] as const;

export const HELP_STATUSES = ["مفتوح", "جاري المساعدة", "تم الحل"] as const;

export const SCENARIO_CATEGORIES = [
  "إدارة الفصل",
  "التعامل مع الطلاب",
  "التحفيز",
  "المشكلات السلوكية",
  "أول يوم تدريس",
  "التواصل مع أولياء الأمور",
  "المواقف المفاجئة",
  "إدارة الوقت",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Idea {
  id: string;
  title: string;
  description: string;
  subject: string;
  stage: string;
  timeMinutes: number;
  tools: string;
  steps: string[];
  likes: number;
  commentsCount: number;
  author: string;
  createdAt: string;
  isIdeaOfDay?: boolean;
}

export interface PostComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface AnonymousPost {
  id: string;
  type: (typeof POST_TYPES)[number];
  content: string;
  anonymous: boolean;
  authorLabel: string;
  likes: number;
  votesFor: number;
  votesAgainst: number;
  comments: PostComment[];
  createdAt: string;
}

export interface HelpResponse {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  helpful: number;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  type: (typeof HELP_TYPES)[number];
  specialization: string;
  stage: string;
  status: (typeof HELP_STATUSES)[number];
  author: string;
  createdAt: string;
  responses: HelpResponse[];
}

export type NotificationKind =
  | "challenge"
  | "reply"
  | "like"
  | "badge"
  | "level"
  | "help_solved"
  | "idea"
  | "welcome";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  xp: number;
}

export interface LevelDef {
  name: string;
  minXp: number;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  specialization: string;
  stage: string;
  role: "user" | "moderator" | "admin";
  status: "نشط" | "معطّل" | "محظور";
  xp: number;
  joinedAt: string;
}

export interface ScenarioRow {
  id: string;
  title: string;
  category: (typeof SCENARIO_CATEGORIES)[number];
  difficulty: "سهل" | "متوسط" | "صعب";
  plays: number;
  rating: number;
}

export interface ReportRow {
  id: string;
  targetType: "فكرة" | "منشور" | "تعليق" | "طلب مساعدة";
  targetTitle: string;
  reason: string;
  reporter: string;
  status: "قيد المراجعة" | "تمت المعالجة" | "مرفوض";
  createdAt: string;
}

export interface ChallengeRow {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  xp: number;
  status: "نشط" | "مجدول" | "منتهي";
}

export interface DemoProfile {
  name: string;
  email: string;
  specialization: string;
  stage: string;
  subjects: string[];
  governorate: string;
  xp: number;
  streak: number;
  badges: string[];
  joinedAt: string;
}

// ---------------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------------

export const LEVELS: LevelDef[] = [
  { name: "مدرس جديد", minXp: 0 },
  { name: "مدرس نشيط", minXp: 100 },
  { name: "مدرس مبدع", minXp: 300 },
  { name: "خبير الفصل", minXp: 700 },
  { name: "أسطورة التدريس", minXp: 1500 },
];

export const BADGES: BadgeDef[] = [
  { id: "first-challenge", name: "أول تحدي", description: "أكملت أول تحدي يومي", xp: 20 },
  { id: "first-idea", name: "أول فكرة", description: "شاركت أول فكرة في مصنع الأفكار", xp: 20 },
  { id: "community-helper", name: "مساعد المجتمع", description: "ساعدت 5 مدرسين في حل مشاكلهم", xp: 50 },
  { id: "innovator-week", name: "مبتكر الأسبوع", description: "فكرتك كانت الأكثر إعجابًا في الأسبوع", xp: 50 },
  { id: "streak-7", name: "7 أيام متتالية", description: "دخلت المنصة 7 أيام ورا بعض", xp: 70 },
  { id: "classroom-expert", name: "خبير إدارة الفصل", description: "أكملت 10 سيناريوهات محاكاة", xp: 80 },
  { id: "ten-ideas", name: "صاحب 10 أفكار", description: "شاركت 10 أفكار عملية", xp: 100 },
  { id: "active-member", name: "عضو نشيط", description: "تفاعلت 30 مرة خلال الشهر", xp: 40 },
];

export const POINTS_RULES: { action: string; xp: number }[] = [
  { action: "المشاركة في تحدي يومي", xp: 10 },
  { action: "إجابة صحيحة في التحدي", xp: 15 },
  { action: "مشاركة فكرة جديدة", xp: 20 },
  { action: "مساعدة مدرس (رد مفيد)", xp: 15 },
  { action: "إكمال سيناريو محاكاة", xp: 25 },
  { action: "الحصول على إعجاب على فكرتك", xp: 2 },
  { action: "تسجيل دخول يومي متتالي", xp: 5 },
];

export function levelForXp(xp: number): LevelDef {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) current = level;
  }
  return current;
}

export function nextLevelForXp(xp: number): LevelDef | null {
  for (const level of LEVELS) {
    if (xp < level.minXp) return level;
  }
  return null;
}

export function xpProgress(xp: number): number {
  const current = levelForXp(xp);
  const next = nextLevelForXp(xp);
  if (!next) return 100;
  const span = next.minXp - current.minXp;
  if (span <= 0) return 100;
  return Math.min(100, Math.round(((xp - current.minXp) / span) * 100));
}

export const DEMO_PROFILE: DemoProfile = {
  name: "أ. أحمد محمد",
  email: "demo@elfasl.app",
  specialization: "الرياضيات",
  stage: "إعدادي",
  subjects: ["الرياضيات", "العلوم"],
  governorate: "الإسماعيلية",
  xp: 340,
  streak: 6,
  badges: ["first-challenge", "first-idea", "active-member"],
  joinedAt: "2026-11-01",
};

// ---------------------------------------------------------------------------
// Zod schemas (server + client validation)
// ---------------------------------------------------------------------------

export const ideaSchema = z.object({
  title: z.string().min(5, "عنوان الفكرة لازم يكون 5 حروف على الأقل").max(120, "العنوان طويل جدًا"),
  description: z.string().min(20, "الوصف لازم يكون 20 حرف على الأقل").max(2000, "الوصف طويل جدًا"),
  subject: z.string().min(1, "اختار المادة"),
  stage: z.string().min(1, "اختار المرحلة"),
  timeMinutes: z.coerce.number().int().min(1, "الوقت لازم يكون دقيقة على الأقل").max(180, "الوقت أقصاه 180 دقيقة"),
  tools: z.string().max(300, "الأدوات طويلة جدًا").optional().default(""),
  steps: z.string().min(10, "اكتب خطوات التنفيذ (10 حروف على الأقل)").max(2000, "الخطوات طويلة جدًا"),
});

export const anonymousPostSchema = z.object({
  type: z.enum(POST_TYPES),
  content: z.string().min(20, "الموقف لازم يكون 20 حرف على الأقل").max(2000, "الموقف طويل جدًا"),
  anonymous: z.boolean().default(true),
});

export const helpRequestSchema = z.object({
  title: z.string().min(5, "عنوان الطلب لازم يكون 5 حروف على الأقل").max(140, "العنوان طويل جدًا"),
  description: z.string().min(20, "الوصف لازم يكون 20 حرف على الأقل").max(2000, "الوصف طويل جدًا"),
  type: z.enum(HELP_TYPES),
  specialization: z.string().min(1, "اختار التخصص"),
  stage: z.string().min(1, "اختار المرحلة"),
});

export const helpResponseSchema = z.object({
  text: z.string().min(10, "الرد لازم يكون 10 حروف على الأقل").max(1500, "الرد طويل جدًا"),
});

export const commentSchema = z.object({
  text: z.string().min(2, "التعليق قصير جدًا").max(800, "التعليق طويل جدًا"),
});

export const challengeSchema = z.object({
  title: z.string().min(5, "عنوان التحدي لازم يكون 5 حروف على الأقل").max(140, "العنوان طويل جدًا"),
  description: z.string().min(20, "وصف التحدي لازم يكون 20 حرف على الأقل").max(2000, "الوصف طويل جدًا"),
  type: z.string().min(1, "اختار نوع التحدي"),
  startDate: z.string().min(1, "حدد تاريخ البداية"),
  endDate: z.string().min(1, "حدد تاريخ النهاية"),
  xp: z.coerce.number().int().min(5, "النقاط 5 على الأقل").max(500, "النقاط أقصاها 500"),
});

export const profileSchema = z.object({
  name: z.string().min(3, "الاسم لازم يكون 3 حروف على الأقل").max(80, "الاسم طويل جدًا"),
  specialization: z.string().min(1, "اختار التخصص"),
  stage: z.string().min(1, "اختار المرحلة"),
  governorate: z.string().optional().default(""),
});

// ---------------------------------------------------------------------------
// Seed data — clearly-marked demo content (Supabase tables replace this later)
// ---------------------------------------------------------------------------

export const SEED_IDEAS: Idea[] = [
  {
    id: "idea-1",
    title: "اشرح الدرس كأنك مذيع أخبار",
    description:
      "حوّل شرح الدرس لنشرة أخبار: أنت المذيع، والطلاب مراسلين من قلب الحدث. كل معلومة تتقال كأنها خبر عاجل، والطلاب يشاركوا بأسئلة الجمهور. الطريقة دي بتخلي الانتباه عالي طول الحصة لأن كل واحد مستني دوره يطلع على الهوا.",
    subject: "العلوم",
    stage: "ابتدائي",
    timeMinutes: 10,
    tools: "مايك لعبة أو أي حاجة شبه المايك، سبورة",
    steps: [
      "ابدأ الحصة بجملة: أهلاً بكم في نشرة أخبار العلوم.",
      "قدّم أول معلومة كخبر عاجل بصوت حماسي.",
      "اختار طالب مراسل يشرح المعلومة اللي بعدها.",
      "افتح باب أسئلة الجمهور في آخر دقيقتين.",
    ],
    likes: 214,
    commentsCount: 31,
    author: "أ. سارة علي",
    createdAt: "2026-11-22",
    isIdeaOfDay: true,
  },
  {
    id: "idea-2",
    title: "المحقق الصغير",
    description:
      "حوّل الدرس لقضية تحقيق: فيه لغز في أول الحصة، والطلاب محققين لازم يجمعوا الأدلة من الدرس عشان يحلوه. كل فقرة في الدرس دليل جديد، وآخر الحصة نكشف الجاني — يعني الإجابة الصح.",
    subject: "اللغة العربية",
    stage: "ابتدائي",
    timeMinutes: 15,
    tools: "بطاقات أدلة مكتوبة، سبورة",
    steps: [
      "اكتب اللغز على السبورة قبل ما الطلاب يدخلوا.",
      "وزّع أدلة ورقية على المجموعات.",
      "كل مجموعة تربط الدليل بفقرة من الدرس.",
      "اجمع الحل في الآخر واكشف الإجابة.",
    ],
    likes: 187,
    commentsCount: 24,
    author: "أ. محمد حسن",
    createdAt: "2026-11-21",
  },
  {
    id: "idea-3",
    title: "سوق الحساب",
    description:
      "اعمل سوق صغير جوه الفصل: كل طالب معاه فلوس ورقية، والمسائل الحسابية هي أسعار السلع. اللي يحل صح يشتري، واللي يغلط يرجّع السلعة. الحساب بيبقى لعبة مش واجب.",
    subject: "الرياضيات",
    stage: "ابتدائي",
    timeMinutes: 20,
    tools: "فلوس ورقية للعبة، بطاقات سلع بأسعار",
    steps: [
      "جهّز بطاقات سلع بأسعار مختلفة.",
      "وزّع فلوس ورقية على كل طالب.",
      "كل عملية شراء لازم تتحل بمسألة حسابية.",
      "اللي يخلّص فلوسه صح من غير غلط يكسب لقب تاجر اليوم.",
    ],
    likes: 176,
    commentsCount: 19,
    author: "أ. أحمد محمد",
    createdAt: "2026-11-20",
  },
  {
    id: "idea-4",
    title: "دقيقة واحدة بس",
    description:
      "تحدي السرعة: اشرح أهم فكرة في الدرس في دقيقة واحدة بس، وبعدين خلّي طالب يعمل نفس التحدي. التركيز بيبقى في أعلى مستوى لأن الوقت ضيق، والطلاب بيتعلموا يلخّصوا.",
    subject: "الفيزياء",
    stage: "ثانوي",
    timeMinutes: 5,
    tools: "مؤقت أو موبايل",
    steps: [
      "شغّل المؤقت على 60 ثانية قدام الفصل كله.",
      "اشرح الفكرة الأساسية بس من غير تفاصيل زيادة.",
      "اختار طالب يشرح نفس الفكرة في دقيقة.",
      "صوّتوا لأفضل شرح سريع.",
    ],
    likes: 163,
    commentsCount: 27,
    author: "أ. منى عبد الله",
    createdAt: "2026-11-22",
  },
  {
    id: "idea-5",
    title: "الفصل فريقين",
    description:
      "قسّم الفصل فريقين وحوّل المراجعة لمسابقة: سؤال لكل فريق بالتناوب، والإجابة الصح بنقطة. الفريق اللي يكسب يختار نشاط الحصة الجاية. المنافسة الصحية بتخلي الكل يذاكر.",
    subject: "الدراسات الاجتماعية",
    stage: "إعدادي",
    timeMinutes: 15,
    tools: "سبورة للنقاط، أسئلة مراجعة",
    steps: [
      "قسّم الفصل فريقين متساويين.",
      "جهّز 10 أسئلة مراجعة من الدرس.",
      "سؤال لكل فريق بالتناوب والإجابة الصح بنقطة.",
      "أعلن الفريق الفائز وخليه يختار نشاط الحصة الجاية.",
    ],
    likes: 158,
    commentsCount: 14,
    author: "أ. كريم سامي",
    createdAt: "2026-11-19",
  },
  {
    id: "idea-6",
    title: "3 صور بس",
    description:
      "اشرح أي معلومة باستخدام 3 صور بس من غير ولا كلمة زيادة. الطلاب يفسّروا الصور ويكتشفوا المعنى بنفسهم، وبعدين أنت تربط الصور بالدرس. الطريقة دي بتنمّي التفكير مش الحفظ.",
    subject: "الأحياء",
    stage: "ثانوي",
    timeMinutes: 8,
    tools: "3 صور مطبوعة أو على الشاشة",
    steps: [
      "اختار 3 صور بتعبر عن فكرة الدرس.",
      "اعرض الصور من غير أي شرح.",
      "اسأل الطلاب: الصور دي بتقول إيه؟",
      "اربط تفسيراتهم بالمعلومة العلمية.",
    ],
    likes: 142,
    commentsCount: 18,
    author: "أ. هبة محمود",
    createdAt: "2026-11-21",
  },
  {
    id: "idea-7",
    title: "خلي الطلاب هم المدرسين 5 دقائق",
    description:
      "كل حصة طالب مختلف يشرح جزء صغير من الدرس لمدة 5 دقائق. اللي بيشرح بيفهم أكتر من اللي بيسمع، وباقي الفصل بيسأل ويناقش. جرّبها أسبوع وهتشوف فرق كبير في الثقة والمشاركة.",
    subject: "اللغة الإنجليزية",
    stage: "إعدادي",
    timeMinutes: 5,
    tools: "جدول أدوار أسبوعي",
    steps: [
      "اعمل جدول أدوار: طالب مختلف كل حصة.",
      "ادّي الطالب الجزء اللي هيشرحه قبلها بيوم.",
      "سيبه يشرح 5 دقائق وأنت بتساعده لو احتاج.",
      "باقي الفصل يسأل، وأنت تلخّص في الآخر.",
    ],
    likes: 138,
    commentsCount: 22,
    author: "أ. عمر فاروق",
    createdAt: "2026-11-18",
  },
  {
    id: "idea-8",
    title: "قصة الدرس",
    description:
      "حوّل الدرس لقصة: فيه بطل ومشكلة ورحلة وحل. القواعد النحوية مثلاً ممكن تبقى شخصيات بتتخانق وتتصالح. الطلاب بيفتكروا القصة، وبالتالي بيفتكروا الدرس.",
    subject: "اللغة العربية",
    stage: "ابتدائي",
    timeMinutes: 12,
    tools: "ولا حاجة — خيالك بس",
    steps: [
      "حوّل عناصر الدرس لشخصيات قصة.",
      "احكي القصة بصوت وحماس.",
      "خلّي الطلاب يكملوا أحداث القصة.",
      "اربط نهاية القصة بالقاعدة أو المعلومة.",
    ],
    likes: 129,
    commentsCount: 16,
    author: "أ. سارة علي",
    createdAt: "2026-11-20",
  },
  {
    id: "idea-9",
    title: "ابدأ بسؤال صادم",
    description:
      "ابدأ الحصة بسؤال يصدم الفصل: هل ممكن تعيش من غير ماية؟ ليه السما زرقا؟ السؤال الصادم بيصحّي الفضول، والدرس كله بيبقى محاولة للإجابة عليه.",
    subject: "العلوم",
    stage: "إعدادي",
    timeMinutes: 3,
    tools: "سؤال واحد قوي",
    steps: [
      "جهّز سؤال صادم مرتبط بفكرة الدرس.",
      "اسأله أول ما تدخل الفصل قبل أي شرح.",
      "سيب الطلاب يتوقعوا إجابات.",
      "قولهم: الإجابة في آخر الحصة.",
    ],
    likes: 121,
    commentsCount: 12,
    author: "أ. محمد حسن",
    createdAt: "2026-11-22",
  },
  {
    id: "idea-10",
    title: "تحدي 60 ثانية",
    description:
      "بطاقة تحدي كل حصة: سؤال واحد والمطلوب إجابته في 60 ثانية. اللي يجاوب صح ياخد نقطة، وأكتر واحد يجمع نقاط في الأسبوع ياخد شارة بطل السرعة. حماس من غير مجهود تحضير.",
    subject: "الرياضيات",
    stage: "إعدادي",
    timeMinutes: 2,
    tools: "بطاقات أسئلة، مؤقت",
    steps: [
      "جهّز بطاقة سؤال سريع كل حصة.",
      "شغّل المؤقت 60 ثانية.",
      "أول إجابة صح تاخد نقطة.",
      "اجمع النقاط أسبوعيًا وأعلن البطل.",
    ],
    likes: 114,
    commentsCount: 9,
    author: "أ. أحمد محمد",
    createdAt: "2026-11-17",
  },
  {
    id: "idea-11",
    title: "اشرح بدون مصطلحات علمية",
    description:
      "تحدي للشرح البسيط: اشرح الدرس لمدة دقيقة كاملة من غير ما تستخدم أي مصطلح علمي. لو استخدمت مصطلح، الطلاب يصفّروا. الطريقة دي بتعلّمك تبسّط، وبتعلّم الطلاب يفهموا مش يحفظوا.",
    subject: "الكيمياء",
    stage: "ثانوي",
    timeMinutes: 4,
    tools: "ولا حاجة",
    steps: [
      "اختار فقرة من الدرس.",
      "اشرحها دقيقة كاملة بكلام عادي بس.",
      "الطلاب يصفّروا لو سمعوا مصطلح علمي.",
      "في الآخر اسألهم: فهمتوا؟ وبعدين اربط بالمصطلحات.",
    ],
    likes: 98,
    commentsCount: 11,
    author: "أ. منى عبد الله",
    createdAt: "2026-11-21",
  },
  {
    id: "idea-12",
    title: "اكتشف الإجابة بنفسك",
    description:
      "بدل ما تقول الإجابة، خلّي الطلاب يكتشفوها: ادّيهم التجربة أو المثال وسيبهم يستنتجوا القاعدة. الاستنتاج الذاتي بيثبّت المعلومة أضعاف الشرح المباشر.",
    subject: "العلوم",
    stage: "ابتدائي",
    timeMinutes: 10,
    tools: "تجربة بسيطة أو مثال من الحياة اليومية",
    steps: [
      "اعرض التجربة أو الموقف من غير ما تقول النتيجة.",
      "اسأل: لاحظتوا إيه؟",
      "سيب المجموعات تناقش وتستنتج.",
      "أكّد الاستنتاج الصح واربطه بالدرس.",
    ],
    likes: 87,
    commentsCount: 8,
    author: "أ. كريم سامي",
    createdAt: "2026-11-19",
  },
];

export const SEED_POSTS: AnonymousPost[] = [
  {
    id: "post-1",
    type: "موقف مضحك",
    content:
      "انهارده طالب في سنة رابعة قام في نص الحصة وقال لي بكل ثقة: يا أستاذ أنا آسف بس حضرتك بتشرح غلط، أنا شفتها على اليوتيوب غير كده. الفصل كله ضحك، وأنا ضحكت معاهم، وبعدين قلت له: طيب تعال اشرحها أنت. قام فعلاً وشرحها صح! من يومها وهو مساعدي الرسمي في الحصة.",
    anonymous: true,
    authorLabel: "مدرس مجهول",
    likes: 342,
    votesFor: 189,
    votesAgainst: 12,
    comments: [
      { id: "c-1", author: "مدرسة مجهولة", text: "نفس اللي حصل معايا بالظبط، اليوتيوب بقى منافس شرس", createdAt: "2026-11-22" },
      { id: "c-2", author: "أ. محمد", text: "أحسن تصرف إنك خليته يشرح، الثقة دي هتفرق معاه جدًا", createdAt: "2026-11-22" },
    ],
    createdAt: "2026-11-22",
  },
  {
    id: "post-2",
    type: "موقف صعب",
    content:
      "طالب عندي فقد والده من شهرين، ومن يومها بقى ساكت خالص ومش بيشارك. جربت أقرب منه بهدوء من غير ما أحرجه قدام زمايله، وبدأ يرد بكلمة واحدة. مش عارف أعمل إيه أكتر من كده من غير ما أتدخل في حاجة مش بتاعتي. نصايحكم؟",
    anonymous: true,
    authorLabel: "مدرس مجهول",
    likes: 256,
    votesFor: 97,
    votesAgainst: 4,
    comments: [
      { id: "c-3", author: "مدرسة مجهولة", text: "كلم الأخصائية الاجتماعية، هي تقدر تتابعه صح من غير ما يحس إنه مختلف", createdAt: "2026-11-21" },
      { id: "c-4", author: "أ. سارة", text: "كلمة واحدة تقدم كبير، الصبر هنا هو الحل", createdAt: "2026-11-21" },
    ],
    createdAt: "2026-11-21",
  },
  {
    id: "post-3",
    type: "مشكلة داخل الفصل",
    content:
      "عندي طالبين بيتخانقوا كل حصة على نفس المقعد، والموضوع بقى يضيع أول 10 دقائق من كل حصة. جربت أغيّر الأماكن فزعلوا الاتنين. حد عنده حل مجرب لمشكلة المقاعد دي؟",
    anonymous: true,
    authorLabel: "مدرس مجهول",
    likes: 178,
    votesFor: 64,
    votesAgainst: 8,
    comments: [
      { id: "c-5", author: "أ. كريم", text: "اعمل جدول مقاعد أسبوعي بالقرعة، القرعة بتحسم الجدل", createdAt: "2026-11-20" },
    ],
    createdAt: "2026-11-20",
  },
  {
    id: "post-4",
    type: "تجربة شخصية",
    content:
      "بعد 12 سنة تدريس اكتشفت إن أحسن حصة عندي مش اللي حضرتها كويس، دي الحصة اللي سبت فيها الطلاب يتكلموا أكتر مني. لما بسكت شوية بسمع إجابات ماكنتش متخيل إنهم عارفينها. جربوا تسكتوا 5 دقائق في الحصة.",
    anonymous: false,
    authorLabel: "أ. هبة محمود",
    likes: 421,
    votesFor: 203,
    votesAgainst: 6,
    comments: [
      { id: "c-6", author: "أ. عمر", text: "جملة من دهب، السكوت التربوي فن", createdAt: "2026-11-22" },
      { id: "c-7", author: "مدرس مجهول", text: "جربتها انهارده، طلع عندهم أفكار ممتازة", createdAt: "2026-11-22" },
    ],
    createdAt: "2026-11-22",
  },
  {
    id: "post-5",
    type: "فضفضة",
    content:
      "أحيانًا بحس إن مجهودي مش باين: بحضّر وبراجع وبعمل أنشطة، وبعدين ييجي امتحان واحد يحدد كل حاجة. بس انهارده طالبة قالت لي: أنا بقيت أحب المادة بسبب حضرتك. الجملة دي كفّت تعب السنة كلها.",
    anonymous: true,
    authorLabel: "مدرسة مجهولة",
    likes: 389,
    votesFor: 156,
    votesAgainst: 2,
    comments: [
      { id: "c-8", author: "أ. منى", text: "الجمل دي هي المرتب الحقيقي بتاعنا", createdAt: "2026-11-21" },
    ],
    createdAt: "2026-11-21",
  },
  {
    id: "post-6",
    type: "طلب رأي",
    content:
      "أولياء الأمور بيطلبوا مني واجبات كتير، وأنا شايف إن الواجب القليل المركز أحسن من الكتير. لو قللت الواجب هزعلهم، ولو زودته هزهق الطلاب. أعمل إيه؟ حد جرب يوازن بين الاتنين؟",
    anonymous: true,
    authorLabel: "مدرس مجهول",
    likes: 145,
    votesFor: 58,
    votesAgainst: 11,
    comments: [
      { id: "c-9", author: "أ. سارة", text: "واجب واحد يومي بجودة عالية + نشاط اختياري للمتميزين، واشرح للأهالي الفكرة في جروب الفصل", createdAt: "2026-11-20" },
    ],
    createdAt: "2026-11-20",
  },
  {
    id: "post-7",
    type: "موقف مضحك",
    content:
      "طالب كتب في الامتحان في سؤال عن عاصمة مصر: القاهرة إن شاء الله. ضحكت جدًا، بس في نفس الوقت عجبني إنه واثق. اديتله الدرجة وكتبت له: إن شاء الله دايمًا صح.",
    anonymous: true,
    authorLabel: "مدرس مجهول",
    likes: 298,
    votesFor: 141,
    votesAgainst: 9,
    comments: [],
    createdAt: "2026-11-19",
  },
  {
    id: "post-8",
    type: "موقف صعب",
    content:
      "أول يوم تدريس ليا: دخلت الفصل وكل الطلاب سكتوا وبصوا لي، ونسيت كل اللي حضرته. وقفت 30 ثانية ساكت، وبعدين قلت لهم: أنا متوتر شوية، ممكن تساعدوني نبدأ؟ الفصل كله شجعني، والحصة عدت أحسن ما كنت متخيل.",
    anonymous: false,
    authorLabel: "أ. عمر فاروق",
    likes: 512,
    votesFor: 231,
    votesAgainst: 3,
    comments: [
      { id: "c-10", author: "مدرسة مجهولة", text: "الصراحة مع الطلاب قوة مش ضعف", createdAt: "2026-11-19" },
      { id: "c-11", author: "أ. أحمد", text: "أول يوم ليا كان شبه كده بالظبط", createdAt: "2026-11-19" },
    ],
    createdAt: "2026-11-19",
  },
  {
    id: "post-9",
    type: "مشكلة داخل الفصل",
    content:
      "في طالب بيقاطعني باستمرار، وكل ما أبدأ الشرح يحاول يلفت انتباه الفصل. جربت أتجاهل وجربت أنبهه بهدوء، ولسه المشكلة موجودة. خايف لو واجهته قدام الفصل أخسره خالص. إيه الحل المجرب؟",
    anonymous: true,
    authorLabel: "مدرس مجهول",
    likes: 167,
    votesFor: 73,
    votesAgainst: 15,
    comments: [
      { id: "c-12", author: "أ. هبة", text: "كلمه لوحدك بعد الحصة وادّيه دور إيجابي: خليه يساعدك في توزيع الأوراق مثلاً", createdAt: "2026-11-18" },
    ],
    createdAt: "2026-11-18",
  },
  {
    id: "post-10",
    type: "تجربة شخصية",
    content:
      "بدأت أعمل آخر 5 دقائق في كل حصة سؤال مفتوح: إيه أكتر حاجة فهمتوها انهارده؟ الإجابات بتوريني أنا شرحت إيه صح وإيه محتاج أعيده. بقت عادة مقدرش أستغنى عنها.",
    anonymous: true,
    authorLabel: "مدرسة مجهولة",
    likes: 203,
    votesFor: 88,
    votesAgainst: 5,
    comments: [],
    createdAt: "2026-11-22",
  },
];

export const SEED_HELP: HelpRequest[] = [
  {
    id: "help-1",
    title: "إزاي أشرح الكسور لسنة رابعة بطريقة عملية؟",
    description:
      "جربت الشرح على السبورة بس الطلاب لسه بيتلخبطوا بين البسط والمقام. محتاج فكرة عملية أو نشاط يخلي الكسر ملموس بالنسبة لهم.",
    type: "محتاج فكرة شرح",
    specialization: "الرياضيات",
    stage: "ابتدائي",
    status: "مفتوح",
    author: "أ. أحمد محمد",
    createdAt: "2026-11-22",
    responses: [],
  },
  {
    id: "help-2",
    title: "نشاط مراجعة قبل امتحان نصف السنة",
    description:
      "عايز نشاط مراجعة لدرس الخلية في الأحياء يكون ممتع ومش مجرد أسئلة تقليدية. الفصل 35 طالب والوقت حصة واحدة بس.",
    type: "محتاج نشاط",
    specialization: "الأحياء",
    stage: "ثانوي",
    status: "مفتوح",
    author: "أ. منى عبد الله",
    createdAt: "2026-11-22",
    responses: [],
  },
  {
    id: "help-3",
    title: "طالب متفوق بقى يمل من الحصة",
    description:
      "عندي طالب متفوق جدًا بقى يمل لأنه بيخلص بسرعة وبيستنى باقي الفصل. إزاي أتحداه من غير ما أظلم باقي الطلاب؟",
    type: "محتاج حل مشكلة",
    specialization: "اللغة الإنجليزية",
    stage: "إعدادي",
    status: "جاري المساعدة",
    author: "أ. عمر فاروق",
    createdAt: "2026-11-21",
    responses: [
      {
        id: "hr-1",
        author: "أ. سارة علي",
        text: "ادّيه مهام إثرائية: أسئلة تحدي إضافية أو خليه يساعد زمايله كمساعد معلم. كده هيحس بقيمته من غير ما يمل.",
        createdAt: "2026-11-21",
        helpful: 12,
      },
    ],
  },
  {
    id: "help-4",
    title: "نموذج امتحان نحو للصف السادس",
    description:
      "محتاج نموذج امتحان نحو للصف السادس الابتدائي يشمل الإعراب والأنواع، لو حد عنده نموذج مجرب يشاركه.",
    type: "محتاج نموذج امتحان",
    specialization: "اللغة العربية",
    stage: "ابتدائي",
    status: "جاري المساعدة",
    author: "أ. كريم سامي",
    createdAt: "2026-11-20",
    responses: [
      {
        id: "hr-2",
        author: "أ. محمد حسن",
        text: "عندي نموذج من 20 سؤال متنوع: 8 إعراب و6 اختياري و6 صح وغلط، أقدر أبعت لك تفاصيله. ابعت لي رسالة.",
        createdAt: "2026-11-20",
        helpful: 8,
      },
    ],
  },
  {
    id: "help-5",
    title: "إزاي أتعامل مع ولي أمر عصبي؟",
    description:
      "ولي أمر جه المدرسة زعلان جدًا على درجة ابنه وبدأ يعلي صوته. اتصرفت بهدوء بس حاسس إني محتاج طريقة أفضل للتعامل في الموقف ده.",
    type: "محتاج نصيحة",
    specialization: "الدراسات الاجتماعية",
    stage: "إعدادي",
    status: "تم الحل",
    author: "أ. هبة محمود",
    createdAt: "2026-11-19",
    responses: [
      {
        id: "hr-3",
        author: "أ. أحمد محمد",
        text: "اسمعه للآخر من غير مقاطعة، وبعدين اعرض الدرجة بالأدلة من ورق الامتحان. الهدوء + الأدلة بيهدوا أي ولي أمر.",
        createdAt: "2026-11-19",
        helpful: 21,
      },
      {
        id: "hr-4",
        author: "أ. سارة علي",
        text: "اتفق معاه على خطة تحسين للطالب، كده بتحول الغضب لتعاون.",
        createdAt: "2026-11-19",
        helpful: 15,
      },
    ],
  },
  {
    id: "help-6",
    title: "تجربة مدرس مع طلاب الدمج",
    description:
      "أول سنة أدرس فصل فيه طلاب دمج، وعايز أسمع تجارب مدرسين جربوا ده قبل كده: إيه اللي نفع وإيه اللي أتجنبه؟",
    type: "محتاج تجربة مدرس آخر",
    specialization: "العلوم",
    stage: "ابتدائي",
    status: "تم الحل",
    author: "أ. سارة علي",
    createdAt: "2026-11-18",
    responses: [
      {
        id: "hr-5",
        author: "أ. منى عبد الله",
        text: "أهم حاجة: أنشطة قصيرة ومتنوعة، وتعليمات واضحة بخطوات صغيرة، وشريك تعلم لكل طالب. وجرّب بطاقات مصورة للتعليمات.",
        createdAt: "2026-11-18",
        helpful: 18,
      },
    ],
  },
  {
    id: "help-7",
    title: "فكرة شرح قانون نيوتن الأول",
    description:
      "الطلاب بيحفظوا القانون بس مش بيفهموه. محتاج فكرة شرح تخلي القصور الذاتي ملموس بحاجة من حياتهم اليومية.",
    type: "محتاج فكرة شرح",
    specialization: "الفيزياء",
    stage: "ثانوي",
    status: "مفتوح",
    author: "أ. كريم سامي",
    createdAt: "2026-11-22",
    responses: [],
  },
  {
    id: "help-8",
    title: "إدارة وقت الحصة مع فصل كبير",
    description:
      "الفصل عندي 45 طالب والحصة 45 دقيقة، والوقت بيضيع في التنظيم. حد عنده نظام مجرب لإدارة الوقت مع الأعداد الكبيرة؟",
    type: "محتاج حل مشكلة",
    specialization: "الرياضيات",
    stage: "إعدادي",
    status: "تم الحل",
    author: "أ. محمد حسن",
    createdAt: "2026-11-17",
    responses: [
      {
        id: "hr-6",
        author: "أ. عمر فاروق",
        text: "قسّم الحصة 3 أجزاء بتوقيت معلن على السبورة: 10 شرح، 15 تطبيق، 15 نشاط + 5 تلخيص. لما الطلاب يعرفوا التوقيت بيلتزموا.",
        createdAt: "2026-11-17",
        helpful: 26,
      },
    ],
  },
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: "n-1", kind: "challenge", title: "تحدي جديد اليوم", body: "تحدي اليوم: اشرح بدون كلام! جرّبه واحصل على 20 نقطة.", createdAt: "2026-11-23 08:00", read: false },
  { id: "n-2", kind: "reply", title: "رد جديد على طلبك", body: "أ. سارة علي ردت على طلبك: إزاي أشرح الكسور لسنة رابعة؟", createdAt: "2026-11-22 19:40", read: false },
  { id: "n-3", kind: "like", title: "فكرتك عجبت المدرسين", body: "فكرة سوق الحساب وصلت 150 إعجاب. كمّل!", createdAt: "2026-11-22 15:12", read: false },
  { id: "n-4", kind: "badge", title: "شارة جديدة!", body: "حصلت على شارة عضو نشيط — 40 نقطة إضافية.", createdAt: "2026-11-21 11:05", read: false },
  { id: "n-5", kind: "level", title: "ترقية مستوى", body: "مبروك! بقيت مدرس مبدع — 300 نقطة. المستوى الجاي: خبير الفصل.", createdAt: "2026-11-21 11:05", read: true },
  { id: "n-6", kind: "help_solved", title: "تم حل طلب مساعدة", body: "طلب إزاي أتعامل مع ولي أمر عصبي؟ اتحل بمساعدة المجتمع.", createdAt: "2026-11-20 17:30", read: true },
  { id: "n-7", kind: "idea", title: "فكرة اليوم", body: "فكرة اليوم من أ. سارة علي: اشرح الدرس كأنك مذيع أخبار.", createdAt: "2026-11-22 08:00", read: true },
  { id: "n-8", kind: "welcome", title: "أهلاً بيك في الفصل", body: "كمّل ملفك الشخصي وابدأ أول تحدي عشان تكسب أول 20 نقطة.", createdAt: "2026-11-01 09:00", read: true },
];

export const SEED_ADMIN_USERS: AdminUserRow[] = [
  { id: "u-1", name: "أ. أحمد محمد", email: "ahmed@elfasl.app", specialization: "الرياضيات", stage: "إعدادي", role: "admin", status: "نشط", xp: 340, joinedAt: "2026-11-01" },
  { id: "u-2", name: "أ. سارة علي", email: "sara@elfasl.app", specialization: "اللغة العربية", stage: "ابتدائي", role: "moderator", status: "نشط", xp: 820, joinedAt: "2026-11-02" },
  { id: "u-3", name: "أ. محمد حسن", email: "mohamed@elfasl.app", specialization: "العلوم", stage: "إعدادي", role: "user", status: "نشط", xp: 540, joinedAt: "2026-11-03" },
  { id: "u-4", name: "أ. منى عبد الله", email: "mona@elfasl.app", specialization: "الفيزياء", stage: "ثانوي", role: "user", status: "نشط", xp: 610, joinedAt: "2026-11-04" },
  { id: "u-5", name: "أ. كريم سامي", email: "karim@elfasl.app", specialization: "الدراسات الاجتماعية", stage: "إعدادي", role: "user", status: "معطّل", xp: 210, joinedAt: "2026-11-05" },
  { id: "u-6", name: "أ. هبة محمود", email: "heba@elfasl.app", specialization: "الأحياء", stage: "ثانوي", role: "user", status: "نشط", xp: 470, joinedAt: "2026-11-06" },
  { id: "u-7", name: "أ. عمر فاروق", email: "omar@elfasl.app", specialization: "اللغة الإنجليزية", stage: "إعدادي", role: "moderator", status: "نشط", xp: 730, joinedAt: "2026-11-07" },
  { id: "u-8", name: "أ. ليلى إبراهيم", email: "laila@elfasl.app", specialization: "الحاسب الآلي", stage: "ثانوي", role: "user", status: "محظور", xp: 95, joinedAt: "2026-11-08" },
];

export const SEED_SCENARIOS: ScenarioRow[] = [
  { id: "s-1", title: "5 طلاب فقدوا التركيز", category: "إدارة الفصل", difficulty: "متوسط", plays: 1240, rating: 4.6 },
  { id: "s-2", title: "طالب بيقاطعك باستمرار", category: "المشكلات السلوكية", difficulty: "متوسط", plays: 980, rating: 4.5 },
  { id: "s-3", title: "أول يوم تدريس", category: "أول يوم تدريس", difficulty: "سهل", plays: 2100, rating: 4.8 },
  { id: "s-4", title: "ولي أمر غاضب في الاجتماع", category: "التواصل مع أولياء الأمور", difficulty: "صعب", plays: 640, rating: 4.4 },
  { id: "s-5", title: "انقطع الكهرباء وسط الحصة", category: "المواقف المفاجئة", difficulty: "صعب", plays: 530, rating: 4.7 },
  { id: "s-6", title: "طالب متفوق زهقان", category: "التحفيز", difficulty: "متوسط", plays: 760, rating: 4.5 },
  { id: "s-7", title: "الوقت خلص والدرس لسه مخلصش", category: "إدارة الوقت", difficulty: "سهل", plays: 890, rating: 4.3 },
  { id: "s-8", title: "طالب بيعيط في الفصل", category: "التعامل مع الطلاب", difficulty: "صعب", plays: 410, rating: 4.6 },
];

export const SEED_REPORTS: ReportRow[] = [
  { id: "r-1", targetType: "منشور", targetTitle: "موقف في الفصل مع طالب مشاغب", reason: "يذكر اسم طالب بالكامل", reporter: "أ. سارة علي", status: "قيد المراجعة", createdAt: "2026-11-22" },
  { id: "r-2", targetType: "تعليق", targetTitle: "تعليق على فكرة سوق الحساب", reason: "ألفاظ غير لائقة", reporter: "أ. محمد حسن", status: "قيد المراجعة", createdAt: "2026-11-22" },
  { id: "r-3", targetType: "فكرة", targetTitle: "فكرة منقولة بدون مصدر", reason: "محتوى منسوخ من موقع آخر", reporter: "أ. منى عبد الله", status: "قيد المراجعة", createdAt: "2026-11-21" },
  { id: "r-4", targetType: "منشور", targetTitle: "فضفضة عن إدارة المدرسة", reason: "تشهير بإدارة المدرسة", reporter: "أ. عمر فاروق", status: "تمت المعالجة", createdAt: "2026-11-20" },
  { id: "r-5", targetType: "طلب مساعدة", targetTitle: "محتاج رقم مدرس فيزياء", reason: "يطلب أرقام هواتف شخصية", reporter: "أ. هبة محمود", status: "تمت المعالجة", createdAt: "2026-11-19" },
  { id: "r-6", targetType: "تعليق", targetTitle: "تعليق ساخر من مدرس جديد", reason: "تنمر", reporter: "أ. كريم سامي", status: "مرفوض", createdAt: "2026-11-18" },
];

export const SEED_CHALLENGES: ChallengeRow[] = [
  { id: "ch-1", title: "اشرح بدون كلام!", description: "اشرح فكرة من درسك باستخدام الإيماءات والصور بس، من غير ولا كلمة. صوّر التجربة أو اكتب اللي حصل.", type: "تحدي ابتكار", startDate: "2026-11-23", endDate: "2026-11-23", xp: 20, status: "نشط" },
  { id: "ch-2", title: "سؤال اليوم: إدارة الوقت", description: "إيه أول حاجة بتعملها لما تحس إن وقت الحصة بيخلص والدرس لسه مخلصش؟", type: "سؤال اليوم", startDate: "2026-11-24", endDate: "2026-11-24", xp: 15, status: "مجدول" },
  { id: "ch-3", title: "تحدي السرعة: 60 ثانية", description: "جاوب على 5 أسئلة ثقافة عامة تربوية في 60 ثانية. الأسرع يكسب نقاط مضاعفة.", type: "تحدي سرعة", startDate: "2026-11-22", endDate: "2026-11-22", xp: 30, status: "منتهي" },
  { id: "ch-4", title: "أفضل فكرة تدريس للأسبوع", description: "شارك أفضل فكرة تدريس جربتها الأسبوع ده. الفكرة الأكثر إعجابًا تكسب شارة مبتكر الأسبوع.", type: "تحدي أفضل فكرة تدريس", startDate: "2026-11-23", endDate: "2026-11-29", xp: 50, status: "نشط" },
];

export const ADMIN_STATS = {
  totalUsers: 1248,
  activeToday: 312,
  totalIdeas: 486,
  totalPosts: 932,
  pendingReports: 3,
  activeChallenges: 2,
  xpGivenThisWeek: 18450,
  newUsersThisWeek: 96,
  topSubjects: [
    { subject: "الرياضيات", count: 132 },
    { subject: "اللغة العربية", count: 118 },
    { subject: "العلوم", count: 104 },
    { subject: "اللغة الإنجليزية", count: 87 },
  ],
  weeklySignups: [12, 18, 9, 22, 15, 11, 9],
};
