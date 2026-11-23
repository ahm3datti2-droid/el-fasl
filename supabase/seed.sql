-- ============================================================================
-- EL FASL | الفصل — seed data (run AFTER supabase/schema.sql)
-- Badges (8) + starter challenges. Simulator scenarios, ideas, and posts are
-- seeded by their own feature owners — this file only covers core data.
--
-- ADMIN DEMO ACCOUNT (do this in the Supabase Dashboard, not here):
--   1. Authentication → Add user → admin@elfasl.app (any password) → confirm it.
--   2. SQL Editor → run:
--        update public.profiles set role = 'admin' where email = 'admin@elfasl.app';
--        insert into public.user_roles (user_id, role)
--        select id, 'admin' from public.profiles where email = 'admin@elfasl.app'
--        on conflict (user_id, role) do nothing;
-- In DEMO MODE (no Supabase env vars) the same email signs in as admin directly.
-- ============================================================================

-- ---------- badges -----------------------------------------------------------

insert into public.badges (slug, name, description, icon) values
  ('first-challenge', 'أول تحدي', 'أكملت أول تحدي في المنصة', 'trophy'),
  ('first-idea', 'أول فكرة', 'شاركت أول فكرة تدريس مع المجتمع', 'lightbulb'),
  ('helper', 'مساعد المجتمع', 'ساعدت 5 مدرسين بحلول عملية', 'users'),
  ('innovator', 'مبتكر الأسبوع', 'فكرتك كانت الأعلى تقييمًا هذا الأسبوع', 'zap'),
  ('streak-7', '7 أيام متتالية', 'دخلت المنصة 7 أيام ورا بعض', 'flame'),
  ('classroom-expert', 'خبير إدارة الفصل', 'أكملت 10 مواقف في محاكي المدرس', 'medal'),
  ('ten-ideas', 'صاحب 10 أفكار', 'شاركت 10 أفكار تدريس', 'star'),
  ('active-member', 'عضو نشيط', 'وصلت إلى 500 نقطة خبرة', 'crown')
on conflict (slug) do nothing;

-- ---------- challenges ---------------------------------------------------------

insert into public.challenges (slug, title, description, type, options, correct_option, explanation, xp_reward, starts_at, ends_at, is_active) values
  (
    'daily-no-words',
    'اشرح بدون كلام!',
    'اشرح فكرة من درسك النهارده باستخدام الإيماءات والرسم على السبورة فقط — من غير ولا كلمة — لمدة 3 دقائق، وشوف الطلاب هيفهموا ولا لأ.',
    'daily',
    '[{"label": "نفذته والطلاب فهموا"}, {"label": "نفذته جزئيًا"}, {"label": "لسه هجرّبه"}]'::jsonb,
    0,
    'الشرح بدون كلام بيجبر الطلاب يركزوا في الصورة والإشارة، وبيكشف مين فاهم الفكرة بجد ومين حافظها بس.',
    30,
    now(),
    now() + interval '7 days',
    true
  ),
  (
    'daily-news-anchor',
    'اشرح الدرس كأنك مذيع أخبار',
    'قدّم درس النهارده بأسلوب نشرة أخبار: «عاجل.. اكتشاف جديد في عالم الكسور!» وخلي الطلاب هم المراسلين.',
    'daily',
    '[{"label": "نفذته وكان ممتعًا"}, {"label": "نفذته جزئيًا"}, {"label": "لسه هجرّبه"}]'::jsonb,
    0,
    'تغيير نبرة الصوت وأسلوب التقديم يكسر روتين الحصة ويخلي المعلومة تثبت لأنها ارتبطت بموقف ممتع.',
    20,
    now() + interval '1 day',
    now() + interval '8 days',
    true
  ),
  (
    'daily-student-teacher',
    'خلي الطلاب هم المدرسين 5 دقائق',
    'اختار طالبين يشرحوا جزء صغير من الدرس لزمايلهم لمدة 5 دقائق، وانت قاعد بتسمع وبتعلّق في الآخر.',
    'daily',
    '[{"label": "نفذته والشرح كان واضحًا"}, {"label": "نفذته جزئيًا"}, {"label": "لسه هجرّبه"}]'::jsonb,
    0,
    'لما الطالب يشرح، بيفهم أعمق بكتير من لما يسمع — والباقي بيركز أكتر لأن اللي بيشرح واحد منهم.',
    20,
    now() + interval '2 days',
    now() + interval '9 days',
    true
  )
on conflict (slug) do nothing;
