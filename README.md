# EL FASL | الفصل

منصة تفاعلية للمعلّمين — **مش مجرد شرح.. تجربة مختلفة كل يوم.**

تحديات يومية، محاكي مواقف تربوية، أفكار تدريس مبتكرة، أدوات صفية، مجتمع مدرسين،
ونظام نقاط وشارات ودوري — كل ده في مكان واحد، من غير تطبيق، ومن الموبايل أولًا.

## Stack

- **Next.js 16.4.6** (App Router, `src/`) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — Auth (email/password) + PostgreSQL + Row Level Security
- **Zod** + **React Hook Form** للتحقق من البيانات
- **Lucide** للأيقونات — **Cairo / IBM Plex Sans Arabic** للخطوط
- استضافة: **Vercel** — كود: **GitHub** — كلها Free Tier

## التشغيل محليًا

```bash
npm install
npm run dev        # http://localhost:3000
```

### الوضع التجريبي (بدون Supabase)

لو مفيش متغيرات بيئة، المنصة بتشتغل في **وضع تجريبي**: سجّل أو ادخل بأي بريد
وكلمة مرور (6 أحرف فأكثر) وهيتم إنشاء جلسة تجريبية في كوكي `httpOnly`
(`el-fasl-demo`) — من غير أي تخزين في localStorage. جرّب:

- `admin@elfasl.app` + أي كلمة مرور ← دخول بدور **admin** (لوحة الإدارة)
- أي بريد آخر ← دخول بدور **user**

بانر أصفر بيوضح إنك في الوضع التجريبي لحد ما تربط Supabase.

## ربط Supabase (التفعيل الكامل)

1. أنشئ مشروعًا في [Supabase](https://supabase.com) (Free Tier).
2. في **SQL Editor** نفّذ بالترتيب:
   - `supabase/schema.sql` — كل الجداول + الـ triggers + سياسات RLS
   - `supabase/seed.sql` — الشارات الـ 8 + تحديات البداية
3. في **Authentication → URL Configuration** ضيف:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback`
4. انسخ `.env.example` إلى `.env.local` واملأ القيم:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (رابط الموقع — يُستخدم في روابط تأكيد البريد واستعادة كلمة المرور)
   - `SUPABASE_SERVICE_ROLE_KEY` (اختياري — لمهام سيرفر مستقبلية فقط، لا يظهر للعميل أبدًا)
5. أعد تشغيل `npm run dev`.

### إنشاء حساب الأدمن

1. من لوحة Supabase: **Authentication → Add user** ← `admin@elfasl.app` (وأكّد الحساب).
2. في SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'admin@elfasl.app';
   insert into public.user_roles (user_id, role)
   select id, 'admin' from public.profiles where email = 'admin@elfasl.app'
   on conflict (user_id, role) do nothing;
   ```

## الحماية (Security)

- كل الصفحات الداخلية محمية **مرتين**: `src/proxy.ts` (Next 16 proxy — مش
  `middleware.ts`) يحوّل الزائر لـ `/login`، و`(app)/layout.tsx` يعيد التحقق من
  الجلسة Server-side قبل عرض أي محتوى — المحتوى المحمي لا يُرسل للزائر أبدًا.
- الجلسات كوكيز آمنة عبر `@supabase/ssr` (تتحدث في الـ proxy مع كل طلب).
- `/admin/*` يتطلب دور `admin` (من `profiles.role` أو كوكي الديمو) — وإلا تحويل
  لـ `/dashboard`.
- كل الجداول عليها RLS، ولا توجد سياسة مفتوحة: القراءة للمستخدمين المسجلين فقط،
  والكتابة لصاحب الصف أو للأدمن/المشرف. الـ XP لا يُمنح من الواجهة أبدًا —
  المنح يتم Server-side فقط.
- لا توجد Secrets في الكود أو في GitHub — كل المفاتيح في متغيرات بيئة.

## بنية المشروع (Phase 1 — Core)

```
src/
  proxy.ts                    # حارس المسارات (Next 16 proxy)
  app/
    layout.tsx                # RTL + Cairo + dark mode (cookie)
    page.tsx                  # صفحة تعريفية عامة فقط
    (auth)/                   # login / register / forgot-password / reset-password
    auth/callback/route.ts    # تأكيد البريد (code exchange)
    auth/signout/route.ts     # تسجيل الخروج
    (app)/                    # layout محمي + dashboard
  components/                 # ui, Navbar, BottomNav, AppShell, DailySituation
  lib/
    auth.ts                   # Server Actions + getSessionUser
    data.ts                   # أنواع + ثوابت (مواد، مراحل، محافظات، مستويات)
    gamification.ts           # مستويات XP + شارات (دوال نقية)
    validation.ts             # مخططات zod
    demo.ts                   # جلسة الوضع التجريبي
    supabase/                 # client / server / proxy (تحديث الجلسة)
supabase/
  schema.sql                  # كل الجداول + RLS
  seed.sql                    # شارات + تحديات البداية
```

## النشر على Vercel

1. ارفع الكود على GitHub.
2. في Vercel: **Import Project** ← اختار المستودع.
3. ضيف نفس متغيرات البيئة من `.env.local` في **Settings → Environment Variables**.
4. Deploy — كل push على `main` بيعمل deploy تلقائي.

## الأوامر

```bash
npm run dev     # تطوير
npm run build   # بناء الإنتاج
npm run lint    # فحص ESLint
npx tsc --noEmit # فحص TypeScript
```
