create extension if not exists "pgcrypto";

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  theme text not null,
  subject text not null,
  skill_focus text not null,
  student_level text not null,
  output_type text not null,
  language text not null default 'English',
  difficulty text not null,
  input_data jsonb not null,
  generated_content jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists materials_user_id_created_at_idx
  on public.materials (user_id, created_at desc);

alter table public.materials enable row level security;

drop policy if exists "Users can view their own materials" on public.materials;
create policy "Users can view their own materials"
on public.materials
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own materials" on public.materials;
create policy "Users can insert their own materials"
on public.materials
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own materials" on public.materials;
create policy "Users can delete their own materials"
on public.materials
for delete
using (auth.uid() = user_id);
