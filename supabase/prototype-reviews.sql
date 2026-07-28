create extension if not exists pgcrypto;

create table if not exists public.prototype_review_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'REVIEWER' check (role in ('REVIEWER','ADMIN')),
  created_at timestamptz not null default now()
);

create table if not exists public.prototype_reviews (
  id uuid primary key default gen_random_uuid(),
  prototype_id text not null,
  prototype_version text not null,
  screen_id text not null,
  component_id text not null,
  component_title text not null,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text not null,
  status text not null check (status in ('PENDENTE','APROVADO','RESSALVA','AJUSTE','DUVIDA')),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prototype_version, component_id, reviewer_id)
);

create index if not exists prototype_reviews_screen_idx on public.prototype_reviews(screen_id);
create index if not exists prototype_reviews_reviewer_idx on public.prototype_reviews(reviewer_id);
alter table public.prototype_review_profiles enable row level security;
alter table public.prototype_reviews enable row level security;

create or replace function public.is_prototype_review_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.prototype_review_profiles where id = (select auth.uid()) and role = 'ADMIN');
$$;

drop policy if exists "profiles own or admin select" on public.prototype_review_profiles;
create policy "profiles own or admin select" on public.prototype_review_profiles for select to authenticated using (id = (select auth.uid()) or public.is_prototype_review_admin());
drop policy if exists "reviews own or admin select" on public.prototype_reviews;
create policy "reviews own or admin select" on public.prototype_reviews for select to authenticated using (reviewer_id = (select auth.uid()) or public.is_prototype_review_admin());
drop policy if exists "reviews own insert" on public.prototype_reviews;
create policy "reviews own insert" on public.prototype_reviews for insert to authenticated with check (reviewer_id = (select auth.uid()));
drop policy if exists "reviews own update" on public.prototype_reviews;
create policy "reviews own update" on public.prototype_reviews for update to authenticated using (reviewer_id = (select auth.uid())) with check (reviewer_id = (select auth.uid()));
grant select on public.prototype_review_profiles to authenticated;
grant select, insert, update on public.prototype_reviews to authenticated;

-- Após criar usuários em Authentication > Users, cadastre os perfis:
-- insert into public.prototype_review_profiles(id,display_name,role)
-- values ('UUID-DO-USUARIO','Nome do avaliador','REVIEWER');
-- Para o responsável que visualizará todas as avaliações, use role = 'ADMIN'.
