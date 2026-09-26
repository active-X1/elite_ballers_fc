-- Elite Ballers FC - Supabase schema
-- Run this entire file in Supabase SQL Editor.
-- Safe principle: public users can read public content; admins can manage it.
-- Do NOT store a service-role key in the website.

create extension if not exists pgcrypto;

-- ---------- Profiles / Admins ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Players ----------
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text,
  number integer,
  image_url text,
  bio text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Fixtures ----------
create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  title text,
  opponent text not null,
  venue text,
  match_date timestamptz not null,
  status text not null default 'upcoming'
    check (status in ('upcoming','cancelled','postponed','completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Results ----------
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  opponent text not null,
  our_goals integer not null default 0 check (our_goals >= 0),
  opponent_goals integer not null default 0 check (opponent_goals >= 0),
  venue text,
  played_on timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- News ----------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  image_url text,
  published_at timestamptz not null default now(),
  published boolean not null default true,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Gallery ----------
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  caption text,
  storage_path text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Dues ----------
create table if not exists public.dues (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  player_name text not null,
  amount numeric(12,2) not null default 100 check (amount >= 0),
  week_start date,
  paid boolean not null default false,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One payment cell per player per week.
drop index if exists dues_player_week_unique;
create unique index if not exists dues_player_week_unique on public.dues(player_id, week_start) where player_id is not null and week_start is not null;


-- ---------- Club Settings ----------
create table if not exists public.club_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

-- ---------- Generic updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists players_updated_at on public.players;
create trigger players_updated_at before update on public.players
for each row execute function public.set_updated_at();

drop trigger if exists fixtures_updated_at on public.fixtures;
create trigger fixtures_updated_at before update on public.fixtures
for each row execute function public.set_updated_at();

drop trigger if exists results_updated_at on public.results;
create trigger results_updated_at before update on public.results
for each row execute function public.set_updated_at();

drop trigger if exists news_updated_at on public.news;
create trigger news_updated_at before update on public.news
for each row execute function public.set_updated_at();

drop trigger if exists dues_updated_at on public.dues;
create trigger dues_updated_at before update on public.dues
for each row execute function public.set_updated_at();

drop trigger if exists club_settings_updated_at on public.club_settings;
create trigger club_settings_updated_at before update on public.club_settings
for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.fixtures enable row level security;
alter table public.results enable row level security;
alter table public.news enable row level security;
alter table public.gallery enable row level security;
alter table public.dues enable row level security;
alter table public.club_settings enable row level security;

-- Avoid recursive profile policy: check auth.uid() directly against profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Public reads
drop policy if exists "Public can read active players" on public.players;
create policy "Public can read active players"
on public.players for select
to anon, authenticated
using (status = 'active');

drop policy if exists "Public can read fixtures" on public.fixtures;
create policy "Public can read fixtures"
on public.fixtures for select
to anon, authenticated
using (true);

drop policy if exists "Public can read results" on public.results;
create policy "Public can read results"
on public.results for select
to anon, authenticated
using (true);

drop policy if exists "Public can read published news" on public.news;
create policy "Public can read published news"
on public.news for select
to anon, authenticated
using (published = true);

drop policy if exists "Public can read gallery" on public.gallery;
create policy "Public can read gallery"
on public.gallery for select
to anon, authenticated
using (true);


-- Public website settings: only explicitly public keys are exposed.
drop policy if exists "Public can read public club settings" on public.club_settings;
create policy "Public can read public club settings"
on public.club_settings for select
to anon, authenticated
using (key in (
  'club_name','contact_email','whatsapp_number','training_location','coach_name','coach_bio',
  'dues_amount','dues_week_start_day'
));

-- Profiles are private except admins reading profiles.
drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
on public.profiles for select
to authenticated
using (public.is_admin() or id = auth.uid());

-- Admin CRUD
drop policy if exists "Admins can manage players" on public.players;
create policy "Admins can manage players"
on public.players for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage fixtures" on public.fixtures;
create policy "Admins can manage fixtures"
on public.fixtures for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage results" on public.results;
create policy "Admins can manage results"
on public.results for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage news" on public.news;
create policy "Admins can manage news"
on public.news for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage gallery" on public.gallery;
create policy "Admins can manage gallery"
on public.gallery for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage dues" on public.dues;
create policy "Admins can manage dues"
on public.dues for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage settings" on public.club_settings;
create policy "Admins can manage settings"
on public.club_settings for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------- Storage ----------
-- Create these buckets in Supabase Storage (or via the dashboard):
-- gallery, players, news
-- Keep them public for simple static-site image URLs, while restricting uploads
-- through storage policies to admins.

insert into public.club_settings (key, value)
values
  ('club_name', 'Elite Ballers FC'),
  ('dues_amount', '100'),
  ('dues_week_start_day', 'monday')
on conflict (key) do nothing;

-- IMPORTANT:
-- Create your first admin user in Supabase Authentication > Users.
-- Then run:
--
-- insert into public.profiles (id, full_name, role)
-- values ('YOUR_AUTH_USER_UUID', 'Cyrus Akacha Cyprian', 'admin')
-- on conflict (id) do update set role = 'admin';
--
-- Do NOT add a public signup flow that automatically grants admin access.


-- Storage: create the public gallery bucket once, then allow only admins to upload/delete.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

drop policy if exists "Admins can upload gallery files" on storage.objects;
create policy "Admins can upload gallery files"
on storage.objects for insert to authenticated
with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admins can update gallery files" on storage.objects;
create policy "Admins can update gallery files"
on storage.objects for update to authenticated
using (bucket_id = 'gallery' and public.is_admin())
with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admins can delete gallery files" on storage.objects;
create policy "Admins can delete gallery files"
on storage.objects for delete to authenticated
using (bucket_id = 'gallery' and public.is_admin());
