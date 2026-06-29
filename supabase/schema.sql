-- =============================================
-- EduLens — Supabase Schema + RLS
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
create table if not exists public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        text not null default 'supervisor' check (role in ('supervisor', 'admin')),
  created_at  timestamptz not null default now(),
  unique (user_id)
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'supervisor'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- TEACHERS
-- =============================================
create table if not exists public.teachers (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  subject           text not null,
  grade_level       text not null,
  school_department text not null,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.teachers enable row level security;

create policy "Users can view own teachers"
  on public.teachers for select
  using (auth.uid() = user_id);

create policy "Users can insert own teachers"
  on public.teachers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own teachers"
  on public.teachers for update
  using (auth.uid() = user_id);

create policy "Users can delete own teachers"
  on public.teachers for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger teachers_updated_at
  before update on public.teachers
  for each row execute procedure public.set_updated_at();

-- =============================================
-- EVALUATIONS
-- =============================================
create table if not exists public.evaluations (
  id                              uuid primary key default uuid_generate_v4(),
  user_id                         uuid not null references auth.users(id) on delete cascade,
  teacher_id                      uuid not null references public.teachers(id) on delete cascade,
  date                            date not null,
  subject                         text not null,
  grade_level                     text not null,
  lesson_topic                    text not null,
  observation_notes               text,
  -- Rubric scores (1-5)
  lesson_planning_score           smallint check (lesson_planning_score between 1 and 5),
  classroom_management_score      smallint check (classroom_management_score between 1 and 5),
  student_engagement_score        smallint check (student_engagement_score between 1 and 5),
  teaching_strategies_score       smallint check (teaching_strategies_score between 1 and 5),
  clarity_score                   smallint check (clarity_score between 1 and 5),
  assessment_score                smallint check (assessment_score between 1 and 5),
  resources_score                 smallint check (resources_score between 1 and 5),
  differentiation_score           smallint check (differentiation_score between 1 and 5),
  time_management_score           smallint check (time_management_score between 1 and 5),
  overall_effectiveness_score     smallint check (overall_effectiveness_score between 1 and 5),
  average_score                   numeric(4,2),
  -- AI output
  ai_strengths                    text,
  ai_improvement_areas            text,
  ai_recommendations              text,
  ai_professional_development_plan text,
  ai_summary                      text,
  -- Final
  final_comments                  text,
  status                          text not null default 'draft' check (status in ('draft', 'completed')),
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);

alter table public.evaluations enable row level security;

create policy "Users can view own evaluations"
  on public.evaluations for select
  using (auth.uid() = user_id);

create policy "Users can insert own evaluations"
  on public.evaluations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own evaluations"
  on public.evaluations for update
  using (auth.uid() = user_id);

create policy "Users can delete own evaluations"
  on public.evaluations for delete
  using (auth.uid() = user_id);

create trigger evaluations_updated_at
  before update on public.evaluations
  for each row execute procedure public.set_updated_at();
