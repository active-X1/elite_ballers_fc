create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  number integer,
  image_url text,
  bio text,
  status text default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  opponent text not null,
  venue text,
  match_date timestamptz not null,
  status text default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  created_at timestamptz not null default now()
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  opponent text not null,
  our_goals integer not null default 0,
  opponent_goals integer not null default 0,
  venue text,
  played_on timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  content text,
  image_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.club_settings (
  id uuid primary key default gen_random_uuid(),
  club_name text not null default 'Elite Ballers FC',
  tagline text,
  hero_title text,
  hero_description text,
  primary_color text default '#d4ff00',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.fixtures enable row level security;
alter table public.results enable row level security;
alter table public.news enable row level security;
alter table public.gallery enable row level security;
alter table public.club_settings enable row level security;

create policy "Public can read profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Public can read players" on public.players for select using (true);
create policy "Public can read fixtures" on public.fixtures for select using (true);
create policy "Public can read results" on public.results for select using (true);
create policy "Public can read news" on public.news for select using (true);
create policy "Public can read gallery" on public.gallery for select using (true);
create policy "Public can read settings" on public.club_settings for select using (true);

create policy "Admins can manage players" on public.players for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins can manage fixtures" on public.fixtures for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins can manage results" on public.results for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins can manage news" on public.news for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins can manage gallery" on public.gallery for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Admins can manage settings" on public.club_settings for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', 'Admin'), 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
