-- ============================================================================
-- EL FASL | الفصل — Supabase schema
-- Run in the Supabase SQL Editor (once). All tables have RLS enabled; there
-- are NO open policies — every policy requires an authenticated user and, where
-- relevant, ownership or the admin role. XP is awarded server-side only.
-- ============================================================================

-- NOTE (2026-11-23): the is_admin() / is_moderator_or_admin() helpers are
-- defined AFTER the profiles table below — SQL-language functions are
-- validated at creation time, so defining them before profiles exists fails
-- on a fresh database (ERROR 42P01). Keep this order.

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ---------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  specialization text,
  stage text,
  subject text,
  governorate text,
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  is_disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_xp_idx on public.profiles (xp desc);
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role helpers (must come AFTER the profiles table — see note above).
create or replace function public.is_admin() returns boolean
language sql stable security definer as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_moderator_or_admin() returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

-- Auto-create a profile row whenever a user signs up (reads raw_user_meta_data).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, specialization, stage, subject, governorate)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'specialization', ''),
    nullif(new.raw_user_meta_data ->> 'stage', ''),
    nullif(new.raw_user_meta_data ->> 'subject', ''),
    nullif(new.raw_user_meta_data ->> 'governorate', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- user_roles -------------------------------------------------------

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'moderator', 'admin')),
  granted_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
create index if not exists user_roles_user_idx on public.user_roles (user_id);

-- ---------- challenges -------------------------------------------------------

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  type text not null default 'daily'
    check (type in ('daily', 'question', 'situation', 'speed', 'general', 'innovation')),
  options jsonb not null default '[]'::jsonb,
  correct_option integer,
  explanation text,
  xp_reward integer not null default 20 check (xp_reward >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists challenges_active_idx on public.challenges (is_active, starts_at desc);
drop trigger if exists challenges_updated_at on public.challenges;
create trigger challenges_updated_at before update on public.challenges
  for each row execute function public.set_updated_at();

create table if not exists public.challenge_participation (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  selected_option integer,
  is_correct boolean,
  xp_earned integer not null default 0 check (xp_earned >= 0),
  completed_at timestamptz not null default now(),
  unique (challenge_id, user_id)
);
create index if not exists challenge_participation_user_idx on public.challenge_participation (user_id);
create index if not exists challenge_participation_challenge_idx on public.challenge_participation (challenge_id);

create table if not exists public.challenge_answers (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null references public.challenge_participation (id) on delete cascade,
  answer_text text,
  created_at timestamptz not null default now()
);
create index if not exists challenge_answers_participation_idx on public.challenge_answers (participation_id);

-- ---------- teacher simulator -----------------------------------------------

create table if not exists public.simulator_scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null check (category in (
    'classroom-management', 'student-relations', 'motivation', 'behavior',
    'first-day', 'parents', 'surprises', 'time-management'
  )),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  xp_reward integer not null default 25 check (xp_reward >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists simulator_scenarios_category_idx on public.simulator_scenarios (category, is_active);
drop trigger if exists simulator_scenarios_updated_at on public.simulator_scenarios;
create trigger simulator_scenarios_updated_at before update on public.simulator_scenarios
  for each row execute function public.set_updated_at();

create table if not exists public.simulator_choices (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.simulator_scenarios (id) on delete cascade,
  label text not null,
  score integer not null default 50 check (score between 0 and 100),
  feedback text not null,
  strength text,
  weakness text,
  next_scenario_id uuid references public.simulator_scenarios (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists simulator_choices_scenario_idx on public.simulator_choices (scenario_id, sort_order);

create table if not exists public.simulator_sessions (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.simulator_scenarios (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  choice_id uuid references public.simulator_choices (id) on delete set null,
  score integer check (score between 0 and 100),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  completed_at timestamptz not null default now()
);
create index if not exists simulator_sessions_user_idx on public.simulator_sessions (user_id, completed_at desc);

-- ---------- idea factory ------------------------------------------------------

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  subject text,
  stage text,
  duration_minutes integer check (duration_minutes > 0),
  tools text,
  steps text,
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  ratings_count integer not null default 0 check (ratings_count >= 0),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ideas_created_idx on public.ideas (created_at desc);
create index if not exists ideas_subject_idx on public.ideas (subject);
create index if not exists ideas_stage_idx on public.ideas (stage);
drop trigger if exists ideas_updated_at on public.ideas;
create trigger ideas_updated_at before update on public.ideas
  for each row execute function public.set_updated_at();

create table if not exists public.idea_votes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (idea_id, user_id)
);
create index if not exists idea_votes_idea_idx on public.idea_votes (idea_id);

create table if not exists public.idea_bookmarks (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (idea_id, user_id)
);
create index if not exists idea_bookmarks_user_idx on public.idea_bookmarks (user_id);

-- ---------- comments (polymorphic: ideas / anonymous_posts / help_requests) ---

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('idea', 'anonymous_post', 'help_request')),
  target_id uuid not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comments_target_idx on public.comments (target_type, target_id, created_at);
drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at before update on public.comments
  for each row execute function public.set_updated_at();

-- ---------- teacher unfiltered (anonymous posts) -----------------------------
-- author_id is stored for moderation only; the app layer never renders it.

create table if not exists public.anonymous_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('funny', 'hard', 'problem', 'personal', 'vent', 'opinion')),
  body text not null check (char_length(body) between 1 and 2000),
  is_anonymous boolean not null default true,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists anonymous_posts_created_idx on public.anonymous_posts (created_at desc);
create index if not exists anonymous_posts_kind_idx on public.anonymous_posts (kind);
drop trigger if exists anonymous_posts_updated_at on public.anonymous_posts;
create trigger anonymous_posts_updated_at before update on public.anonymous_posts
  for each row execute function public.set_updated_at();

-- ---------- teacher help network ----------------------------------------------

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  need_type text not null check (need_type in ('idea', 'activity', 'problem', 'exam', 'advice', 'experience')),
  subject text,
  stage text,
  status text not null default 'open' check (status in ('open', 'helping', 'solved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists help_requests_status_idx on public.help_requests (status, created_at desc);
drop trigger if exists help_requests_updated_at on public.help_requests;
create trigger help_requests_updated_at before update on public.help_requests
  for each row execute function public.set_updated_at();

create table if not exists public.help_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.help_requests (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  is_accepted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists help_responses_request_idx on public.help_responses (request_id, created_at);

-- ---------- gamification -------------------------------------------------------

create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null,
  reason text not null,
  source_type text,
  source_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists points_transactions_user_idx on public.points_transactions (user_id, created_at desc);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null default 'trophy',
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
create index if not exists user_badges_user_idx on public.user_badges (user_id);

create table if not exists public.streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_active_date date,
  updated_at timestamptz not null default now()
);

-- ---------- notifications -------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

-- ---------- reports (moderation) ------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('idea', 'anonymous_post', 'comment', 'help_request')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);
drop trigger if exists reports_updated_at on public.reports;
create trigger reports_updated_at before update on public.reports
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS — enabled on every table. No anonymous (anon) access at all.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participation enable row level security;
alter table public.challenge_answers enable row level security;
alter table public.simulator_scenarios enable row level security;
alter table public.simulator_choices enable row level security;
alter table public.simulator_sessions enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_votes enable row level security;
alter table public.idea_bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.anonymous_posts enable row level security;
alter table public.help_requests enable row level security;
alter table public.help_responses enable row level security;
alter table public.points_transactions enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.streaks enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- profiles: readable by any signed-in user; editable only by the owner or admin.
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy "profiles_delete_admin" on public.profiles for delete to authenticated using (public.is_admin());

-- user_roles: owners see their own roles; admins manage all.
create policy "user_roles_select" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "user_roles_admin_write" on public.user_roles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- challenges: readable by all signed-in users; managed by admins.
create policy "challenges_select" on public.challenges for select to authenticated using (true);
create policy "challenges_admin_write" on public.challenges for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- challenge_participation: own rows only (admins see all).
create policy "participation_select" on public.challenge_participation for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "participation_insert_own" on public.challenge_participation for insert to authenticated
  with check (user_id = auth.uid());
create policy "participation_update_own" on public.challenge_participation for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "challenge_answers_select" on public.challenge_answers for select to authenticated
  using (exists (
    select 1 from public.challenge_participation p
    where p.id = participation_id and (p.user_id = auth.uid() or public.is_admin())
  ));
create policy "challenge_answers_insert_own" on public.challenge_answers for insert to authenticated
  with check (exists (
    select 1 from public.challenge_participation p
    where p.id = participation_id and p.user_id = auth.uid()
  ));

-- simulator: scenarios/choices readable by all signed-in users, managed by admins.
create policy "simulator_scenarios_select" on public.simulator_scenarios for select to authenticated using (true);
create policy "simulator_scenarios_admin_write" on public.simulator_scenarios for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "simulator_choices_select" on public.simulator_choices for select to authenticated using (true);
create policy "simulator_choices_admin_write" on public.simulator_choices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "simulator_sessions_select" on public.simulator_sessions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "simulator_sessions_insert_own" on public.simulator_sessions for insert to authenticated
  with check (user_id = auth.uid());

-- ideas: readable by all; authors manage their own; moderators/admins moderate.
create policy "ideas_select" on public.ideas for select to authenticated using (true);
create policy "ideas_insert_own" on public.ideas for insert to authenticated with check (author_id = auth.uid());
create policy "ideas_update_own_or_mod" on public.ideas for update to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin())
  with check (author_id = auth.uid() or public.is_moderator_or_admin());
create policy "ideas_delete_own_or_mod" on public.ideas for delete to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin());

create policy "idea_votes_select" on public.idea_votes for select to authenticated using (true);
create policy "idea_votes_insert_own" on public.idea_votes for insert to authenticated with check (user_id = auth.uid());
create policy "idea_votes_delete_own" on public.idea_votes for delete to authenticated using (user_id = auth.uid());

create policy "idea_bookmarks_select" on public.idea_bookmarks for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "idea_bookmarks_insert_own" on public.idea_bookmarks for insert to authenticated with check (user_id = auth.uid());
create policy "idea_bookmarks_delete_own" on public.idea_bookmarks for delete to authenticated using (user_id = auth.uid());

-- comments: readable by all signed-in users (hidden ones excluded at app level);
-- authors manage their own; moderators/admins can hide/delete.
create policy "comments_select" on public.comments for select to authenticated using (true);
create policy "comments_insert_own" on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy "comments_update_own_or_mod" on public.comments for update to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin())
  with check (author_id = auth.uid() or public.is_moderator_or_admin());
create policy "comments_delete_own_or_mod" on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin());

-- anonymous posts: readable by all signed-in users; authors manage their own;
-- moderators/admins moderate. author_id is never rendered by the app.
create policy "anon_posts_select" on public.anonymous_posts for select to authenticated using (true);
create policy "anon_posts_insert_own" on public.anonymous_posts for insert to authenticated with check (author_id = auth.uid());
create policy "anon_posts_update_own_or_mod" on public.anonymous_posts for update to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin())
  with check (author_id = auth.uid() or public.is_moderator_or_admin());
create policy "anon_posts_delete_own_or_mod" on public.anonymous_posts for delete to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin());

-- help requests / responses
create policy "help_requests_select" on public.help_requests for select to authenticated using (true);
create policy "help_requests_insert_own" on public.help_requests for insert to authenticated with check (author_id = auth.uid());
create policy "help_requests_update_own_or_mod" on public.help_requests for update to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin())
  with check (author_id = auth.uid() or public.is_moderator_or_admin());
create policy "help_requests_delete_own_or_mod" on public.help_requests for delete to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin());
create policy "help_responses_select" on public.help_responses for select to authenticated using (true);
create policy "help_responses_insert_own" on public.help_responses for insert to authenticated with check (author_id = auth.uid());
create policy "help_responses_update_own_or_mod" on public.help_responses for update to authenticated
  using (author_id = auth.uid() or public.is_moderator_or_admin())
  with check (author_id = auth.uid() or public.is_moderator_or_admin());

-- points: users read their own history; rows are written by the server (service role
-- bypasses RLS) or by an admin. Clients must never award their own XP.
create policy "points_select_own" on public.points_transactions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "points_insert_admin" on public.points_transactions for insert to authenticated
  with check (public.is_admin());

-- badges: readable by all; managed by admins.
create policy "badges_select" on public.badges for select to authenticated using (true);
create policy "badges_admin_write" on public.badges for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- user_badges: users see their own; awarded by admins / the server only.
create policy "user_badges_select" on public.user_badges for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "user_badges_admin_write" on public.user_badges for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- streaks: own row only.
create policy "streaks_select_own" on public.streaks for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "streaks_insert_own" on public.streaks for insert to authenticated with check (user_id = auth.uid());
create policy "streaks_update_own" on public.streaks for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- notifications: own only; created by admins / the server.
create policy "notifications_select_own" on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_insert_admin" on public.notifications for insert to authenticated
  with check (public.is_admin());

-- reports: reporters see their own; moderators/admins see and manage all.
create policy "reports_select" on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_moderator_or_admin());
create policy "reports_insert_own" on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy "reports_update_mod" on public.reports for update to authenticated
  using (public.is_moderator_or_admin()) with check (public.is_moderator_or_admin());

-- Explicit grants: authenticated users only. The anon role gets nothing.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ============================================================================
-- Site visits — real visitor counting for the admin dashboard (added 2026-11-24).
-- One row per visitor per day (unique visitor_id + day); the tracker upserts
-- it, so repeat page views by the same visitor on the same day add nothing.
-- EXCEPTION to the "anon gets nothing" rule above: anon may ONLY insert
-- rows here (no select/update/delete) so anonymous landing-page visitors are
-- counted too. Reads are admin-only. Abuse surface is one insert per
-- visitor per day; the table holds no personal data (random visitor id only).
-- ============================================================================
create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  path text not null default '/',
  day date not null default current_date,
  created_at timestamptz not null default now(),
  unique (visitor_id, day)
);
create index if not exists site_visits_day_idx on public.site_visits (day desc, created_at desc);

alter table public.site_visits enable row level security;
drop policy if exists "site_visits_insert_any" on public.site_visits;
create policy "site_visits_insert_any" on public.site_visits for insert to anon, authenticated with check (true);
drop policy if exists "site_visits_select_admin" on public.site_visits;
create policy "site_visits_select_admin" on public.site_visits for select to authenticated using (public.is_admin());
grant insert on public.site_visits to anon;
grant select, insert on public.site_visits to authenticated;
