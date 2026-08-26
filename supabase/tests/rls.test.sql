-- =============================================================
-- Mindfulnity: Test keamanan RLS
-- Jalankan di Supabase Dashboard -> SQL Editor (wajib sudah menjalankan
-- migrasi 20260818_init.sql dulu). Skrip ini akan menampilkan "OK" untuk
-- tiap asersi yang lolos, dan melempar error jika ada kebocoran.
-- =============================================================

begin;

-- Siapkan dua user uji
insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-000000000001', 'user-a@test.local'),
  ('00000000-0000-0000-0000-000000000002', 'user-b@test.local')
on conflict (id) do nothing;

-- Data milik user A
insert into public.sessions (id, user_id, title, goal, guide, sound_mix, duration_min, phases)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001',
   'Sesi A', 'sleep', 'mentor', '{"nature": [], "instruments": []}', 10,
   '[{"id":"arrive","title":"Kedatangan","lines":["x"]}]')
on conflict (id) do nothing;

insert into public.mood_entries (id, user_id, date, mood)
values
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001',
   current_date, 4)
on conflict (id) do nothing;

-- Sebagai anonim, semua akses harus ditolak
set local role anon;
do $$
begin
  if exists (select 1 from public.sessions limit 1) then
    raise exception 'RLS GAGAL: anon bisa membaca sessions';
  end if;
end $$;
reset role;
do $$ begin raise notice 'OK: anon tidak bisa membaca sessions'; end $$;

-- Sebagai user A, hanya datanya sendiri yang terlihat
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001"}';
do $$
declare
  n int;
begin
  select count(*) into n from public.sessions;
  if n <> 1 then
    raise exception 'RLS GAGAL: user A melihat % baris (harusnya 1)', n;
  end if;
  if exists (select 1 from public.sessions where title = 'Sesi B') then
    raise exception 'RLS GAGAL: user A bisa membaca data user B';
  end if;
end $$;
do $$ begin raise notice 'OK: user A hanya melihat datanya sendiri'; end $$;

-- User A bisa menulis sesi miliknya
do $$
declare
  new_id uuid;
begin
  insert into public.sessions (user_id, title, goal, guide, sound_mix, duration_min, phases)
  values ('00000000-0000-0000-0000-000000000001', 'Sesi A2', 'focus', 'friend',
          '{"nature": [], "instruments": []}', 5,
          '[{"id":"arrive","title":"Kedatangan","lines":["x"]}]')
  returning id into new_id;

  delete from public.sessions where id = new_id;
end $$;
do $$ begin raise notice 'OK: user A bisa menulis & menghapus datanya sendiri'; end $$;

-- User A TIDAK boleh mengubah data user B
do $$
begin
  begin
    insert into public.sessions (user_id, title, goal, guide, sound_mix, duration_min, phases)
    values ('00000000-0000-0000-0000-000000000002', 'Sesi B yang dibajak', 'sleep',
            'mentor', '{"nature": [], "instruments": []}', 10,
            '[{"id":"arrive","title":"Kedatangan","lines":["x"]}]');
    raise exception 'RLS GAGAL: user A bisa menulis atas nama user B';
  exception
    when insufficient_privilege or others then
      null; -- ditolak seperti yang diharapkan
  end;
end $$;
do $$ begin raise notice 'OK: user A tidak bisa menulis atas nama user B'; end $$;

-- Relasi: mood check-in bisa dihubungkan ke sesi milik user A
do $$
declare
  mood_id uuid;
begin
  insert into public.mood_entries (user_id, date, mood, source, session_id)
  values ('00000000-0000-0000-0000-000000000001', current_date, 3, 'checkin',
          '11111111-1111-1111-1111-111111111111')
  returning id into mood_id;
  delete from public.mood_entries where id = mood_id;
end $$;
do $$ begin raise notice 'OK: mood check-in tertaut session_id milik sendiri'; end $$;

-- Check-in kedua sesi yang sama di hari sama DITOLAK (unique user_id, session_id)
do $$
begin
  insert into public.mood_entries (user_id, date, mood, source, session_id)
  values ('00000000-0000-0000-0000-000000000001', current_date, 3, 'checkin',
          '11111111-1111-1111-1111-111111111111');
  begin
    insert into public.mood_entries (user_id, date, mood, source, session_id)
    values ('00000000-0000-0000-0000-000000000001', current_date, 5, 'checkin',
            '11111111-1111-1111-1111-111111111111');
    raise exception 'GAGAL: check-in duplikat per sesi harus ditolak';
  exception
    when unique_violation then
      null; -- sesuai harapan
  end;
end $$;
do $$ begin raise notice 'OK: 1 check-in per sesi'; end $$;

-- Entri manual kedua di hari sama DITOLAK (unique user_id, date, source)
do $$
begin
  begin
    insert into public.mood_entries (user_id, date, mood, source)
    values ('00000000-0000-0000-0000-000000000001', current_date, 2, 'manual');
    raise exception 'GAGAL: mood manual duplikat per hari harus ditolak';
  exception
    when unique_violation then
      null; -- sesuai harapan
  end;
end $$;
do $$ begin raise notice 'OK: 1 mood manual per hari'; end $$;

-- Menghapus sesi ikut menghapus mood check-in-nya (cascade)
do $$
declare
  s_id uuid;
  m_id uuid;
begin
  insert into public.sessions (user_id, title, goal, guide, sound_mix, duration_min, phases)
  values ('00000000-0000-0000-0000-000000000001', 'Sesi cascade', 'relax', 'parent',
          '{"nature": [], "instruments": []}', 5,
          '[{"id":"arrive","title":"Kedatangan","lines":["x"]}]')
  returning id into s_id;

  insert into public.mood_entries (user_id, date, mood, source, session_id)
  values ('00000000-0000-0000-0000-000000000001', current_date, 4, 'checkin', s_id)
  returning id into m_id;

  delete from public.sessions where id = s_id;

  if exists (select 1 from public.mood_entries where id = m_id) then
    raise exception 'GAGAL: mood check-in harus ikut terhapus saat sesi dihapus';
  end if;
end $$;
do $$ begin raise notice 'OK: hapus sesi meng-cascade mood check-in'; end $$;

reset role;
rollback;

-- Tidak ada data uji yang tersisa (rollback). Semua "OK" = RLS aman.