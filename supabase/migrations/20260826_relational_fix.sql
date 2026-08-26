-- Mindfulnity: relasi mood_entries ↔ sessions + maintainability
-- 1) FK session_id (cascade) — mood check-in bisa ditelusuri ke sesi asalnya
-- 2) Uniqueness:
--    - check-in: 1 per sesi (unique user_id, session_id)
--    - manual: 1 per hari (partial unique (user_id, date) where source = 'manual')
--      → 2+ sesi dalam 1 hari TIDAK saling menimpa mood check-in
-- 3) updated_at + trigger di kedua tabel
-- 4) comment on untuk semantik kolom

alter table public.mood_entries
  add column session_id uuid references public.sessions (id) on delete cascade;

alter table public.mood_entries drop constraint mood_entries_user_id_date_key;
alter table public.mood_entries add constraint mood_entries_user_session_key
  unique (user_id, session_id);
create unique index mood_entries_user_date_manual_idx
  on public.mood_entries (user_id, date)
  where source = 'manual';

alter table public.sessions add column updated_at timestamptz not null default now();
alter table public.mood_entries add column updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

create trigger mood_entries_set_updated_at
  before update on public.mood_entries
  for each row execute function public.set_updated_at();

comment on column public.sessions.goal is
  'Tujuan sesi: sleep | stress | focus | confidence | relax | energy';
comment on column public.sessions.guide is
  'Persona guide: mentor | friend | parent | futureSelf';
comment on column public.sessions.sound_mix is
  'Campuran suara: {nature: SoundId[], instruments: SoundId[]}';
comment on column public.sessions.phases is
  'Skrip 7 fase: [{id, title, lines[]}] — ditulis AI (fallback template lokal)';
comment on column public.mood_entries.source is
  'manual (maks 1/hari) atau checkin (maks 1/sesi)';
comment on column public.mood_entries.session_id is
  'Sesi asal untuk entri source=checkin; NULL untuk entri manual';