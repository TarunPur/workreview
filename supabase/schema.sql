-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  linkedin_url text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Profiles (people being reviewed)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  current_company text not null,
  current_title text,
  linkedin_url text,
  slug text unique not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable" on public.profiles
  for select using (true);

create policy "Authenticated users can create profiles" on public.profiles
  for insert with check (auth.role() = 'authenticated');

-- Full-text search index on profiles
create index profiles_fts_idx on public.profiles
  using gin (to_tsvector('english', full_name || ' ' || current_company));

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  reviewer_id uuid references public.users(id) not null,
  relationship_type text check (relationship_type in ('manager','peer','direct_report','colleague')) not null,
  content text not null,
  is_anonymous boolean default false not null,
  is_flagged boolean default false not null,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Non-flagged reviews are publicly readable" on public.reviews
  for select using (is_flagged = false);

create policy "Authenticated users can create reviews" on public.reviews
  for insert with check (auth.uid() = reviewer_id);

-- Flags
create table public.flags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id) on delete cascade not null,
  reporter_id uuid references public.users(id) not null,
  reason text,
  created_at timestamptz default now(),
  unique(review_id, reporter_id)
);

alter table public.flags enable row level security;

create policy "Authenticated users can flag reviews" on public.flags
  for insert with check (auth.uid() = reporter_id);

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
