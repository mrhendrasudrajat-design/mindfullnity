-- Mindfulnity: migrasi awal (tabel aplikasi + RLS)
-- Tempel seluruh isi file ini di Supabase Dashboard -> SQL Editor -> Run

-- =============================================================
-- Tabel sessions
-- =============================================================
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  goal text not null check (goal in ('sleep', 'stress', 'focus', 'confidence', 'relax', 'energy')),
  guide text not null check (guide in ('mentor', 'friend', 'parent', 'futureSelf')),
  sound_mix jsonb not null default '{"nature": [], "instruments": []}',
  duration_min int not null check (duration_min between 1 and 240),
  phases jsonb not null,
  mood_before int check (mood_before between 1 and 5),
  mood_after int check (mood_after between 1 and 5),
  reflection text,
  integration_action text,
  created_at timestamptz not null default now()
);

create index if not exists sessions_user_created_idx
  on public.sessions (user_id, created_at desc);

alter table public.sessions enable row level security;

create policy "sessions_select_own" on public.sessions
  for select using (auth.uid() = user_id);

create policy "sessions_insert_own" on public.sessions
  for insert with check (auth.uid() = user_id);

create policy "sessions_update_own" on public.sessions
  for update using (auth.uid() = user_id);

create policy "sessions_delete_own" on public.sessions
  for delete using (auth.uid() = user_id);

-- =============================================================
-- Tabel mood_entries
-- =============================================================
create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  mood int not null check (mood between 1 and 5),
  note text,
  source text not null default 'manual' check (source in ('manual', 'checkin')),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists mood_entries_user_date_idx
  on public.mood_entries (user_id, date desc);

alter table public.mood_entries enable row level security;

create policy "mood_entries_select_own" on public.mood_entries
  for select using (auth.uid() = user_id);

create policy "mood_entries_insert_own" on public.mood_entries
  for insert with check (auth.uid() = user_id);

create policy "mood_entries_update_own" on public.mood_entries
  for update using (auth.uid() = user_id);

create policy "mood_entries_delete_own" on public.mood_entries
  for delete using (auth.uid() = user_id);
