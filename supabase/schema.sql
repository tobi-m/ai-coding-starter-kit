-- PROJ-1: Supabase Infrastructure Setup
-- Run this in the Supabase Dashboard → SQL Editor

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  systolic integer not null,
  diastolic integer not null,
  pulse integer not null,
  measured_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.measurements enable row level security;

create policy "Users can select own measurements"
  on public.measurements for select
  using (auth.uid() = user_id);

create policy "Users can insert own measurements"
  on public.measurements for insert
  with check (auth.uid() = user_id);

create policy "Users can update own measurements"
  on public.measurements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own measurements"
  on public.measurements for delete
  using (auth.uid() = user_id);

create index idx_measurements_user_id on public.measurements(user_id);
create index idx_measurements_measured_at on public.measurements(user_id, measured_at desc);
