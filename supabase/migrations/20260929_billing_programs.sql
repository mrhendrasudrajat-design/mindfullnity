-- Mindfulnity: billing + program 7/21/90 + DOKU Checkout paywall
-- Relasi: programs 1--N program_days, programs 1--N program_enrollments, enrollments 1--N program_progress (→ sessions), programs/payments/entitlements terhubung via program_id + user_id

-- Pastikan ekstensi uuid
create extension if not exists "pgcrypto";

-- 1) Katalog program (3 produk: 7/21/90)
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('program-7','program-21','program-90')),
  title text not null,
  duration_days int not null check (duration_days in (7,21,90)),
  price_idr int not null check (price_idr > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists programs_slug_idx on public.programs (slug);
create index if not exists programs_duration_idx on public.programs (duration_days);

-- Trigger updated_at (reuse fungsi set_updated_at jika sudah ada)
do $$ begin
  if not exists (select 1 from pg_proc where proname = 'set_updated_at') then
    create or replace function public.set_updated_at()
    returns trigger language plpgsql set search_path = pg_catalog, public as $f$
    begin new.updated_at = now(); return new; end; $f$;
  end if;
end $$;

drop trigger if exists programs_set_updated_at on public.programs;
create trigger programs_set_updated_at before update on public.programs for each row execute function public.set_updated_at();

comment on table public.programs is 'Katalog program berjenjang 7/21/90 hari';
comment on column public.programs.price_idr is 'Harga dalam IDR (sumber kebenaran); USD dihitung FX_IDR_PER_USD untuk display EN';

-- Seed 3 program (idempotent)
insert into public.programs (slug, title, duration_days, price_idr) values
  ('program-7','Program 7 Hari',7,19000),
  ('program-21','Program 21 Hari',21,49000),
  ('program-90','Program 90 Hari',90,99000)
on conflict (slug) do update set title=excluded.title, duration_days=excluded.duration_days, price_idr=excluded.price_idr, updated_at=now();

-- 2) Hari per program (118 rows total)
create table if not exists public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  day_number int not null check (day_number >= 1 and day_number <= 90),
  title text not null,
  goal text not null check (goal in ('sleep','stress','focus','confidence','relax','energy')),
  phases jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(program_id, day_number)
);
create index if not exists program_days_program_idx on public.program_days (program_id);
drop trigger if exists program_days_set_updated_at on public.program_days;
create trigger program_days_set_updated_at before update on public.program_days for each row execute function public.set_updated_at();
comment on table public.program_days is 'Hari ke-N per program; phases = 7 fase (arrive..return) jsonb';
comment on column public.program_days.phases is 'Array Phase {id,title,lines[]} — reuse templates.ts PHASE_IDS; diisi seed atau generate via AI saat enroll';

-- 3) Enrollment user → program
create table if not exists public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  status text not null default 'active' check (status in ('active','completed','expired')),
  current_day int not null default 1 check (current_day >= 1),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists program_enrollments_user_idx on public.program_enrollments (user_id);
create index if not exists program_enrollments_program_idx on public.program_enrollments (program_id);
create unique index if not exists program_enrollments_one_active_per_user_program
  on public.program_enrollments (user_id, program_id) where status = 'active';
drop trigger if exists program_enrollments_set_updated_at on public.program_enrollments;
create trigger program_enrollments_set_updated_at before update on public.program_enrollments for each row execute function public.set_updated_at();
comment on table public.program_enrollments is 'Enrollment user ke program; 1 active per (user,program); current_day unlock harian';
comment on column public.program_enrollments.current_day is 'Hari yang boleh dibuka sekarang (1..duration_days); naik saat progress day selesai';

-- 4) Progress per hari (terhubung ke sessions untuk menyimpan hasil sesi harian)
create table if not exists public.program_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.program_enrollments(id) on delete cascade,
  day_number int not null check (day_number >= 1),
  session_id uuid references public.sessions(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(enrollment_id, day_number)
);
create index if not exists program_progress_enrollment_idx on public.program_progress (enrollment_id);
create index if not exists program_progress_session_idx on public.program_progress (session_id);
drop trigger if exists program_progress_set_updated_at on public.program_progress;
create trigger program_progress_set_updated_at before update on public.program_progress for each row execute function public.set_updated_at();
comment on table public.program_progress is 'Progress harian; day N unlock setelah N-1 completed; session_id → sessions(id) menyimpan hasil meditasi hari itu';
comment on column public.program_progress.session_id is 'FK ke sessions(id) — relasi program → session; set null jika session dihapus, progress tetap';

-- 5) Payments (DOKU Checkout)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  amount int not null check (amount > 0),
  currency text not null check (currency in ('IDR','USD')),
  display_currency text not null,
  display_amount numeric not null,
  doku_invoice_id text unique,
  doku_checkout_url text,
  doku_status text not null default 'pending' check (doku_status in ('pending','paid','failed','expired')),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists payments_program_idx on public.payments (program_id);
create index if not exists payments_doku_invoice_idx on public.payments (doku_invoice_id);
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();
comment on table public.payments is 'Pembayaran DOKU Checkout; amount IDR settle ke DOKU; display_* untuk kwitansi locale';
comment on column public.payments.doku_invoice_id is 'Order/invoice id di DOKU (unique, idempotent untuk webhook)';
comment on column public.payments.doku_status is 'pending → paid/failed/expired via webhook';

-- 6) Entitlements (akses setelah bayar)
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  source text not null check (source in ('payment','grant')),
  payment_id uuid references public.payments(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, program_id)
);
create index if not exists entitlements_user_idx on public.entitlements (user_id);
create index if not exists entitlements_payment_idx on public.entitlements (payment_id);
drop trigger if exists entitlements_set_updated_at on public.entitlements;
create trigger entitlements_set_updated_at before update on public.entitlements for each row execute function public.set_updated_at();
comment on table public.entitlements is 'Akses program setelah bayar; 1 per (user,program); dibuat via webhook service_role';
comment on column public.entitlements.payment_id is 'FK ke payments(id) — relasi entitlement ← payment';

-- RLS
alter table public.programs enable row level security;
alter table public.program_days enable row level security;
alter table public.program_enrollments enable row level security;
alter table public.program_progress enable row level security;
alter table public.payments enable row level security;
alter table public.entitlements enable row level security;

-- programs & program_days: read untuk semua authenticated (katalog publik setelah login)
drop policy if exists "programs_select_authenticated" on public.programs;
create policy "programs_select_authenticated" on public.programs for select to authenticated using (true);
drop policy if exists "program_days_select_authenticated" on public.program_days;
create policy "program_days_select_authenticated" on public.program_days for select to authenticated using (true);

-- user-scoped tables: user_id = auth.uid()
drop policy if exists "enrollments_select_own" on public.program_enrollments;
create policy "enrollments_select_own" on public.program_enrollments for select using (auth.uid() = user_id);
drop policy if exists "enrollments_insert_own" on public.program_enrollments;
create policy "enrollments_insert_own" on public.program_enrollments for insert with check (auth.uid() = user_id);
drop policy if exists "enrollments_update_own" on public.program_enrollments;
create policy "enrollments_update_own" on public.program_enrollments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "progress_select_own" on public.program_progress;
create policy "progress_select_own" on public.program_progress for select using (
  exists (select 1 from public.program_enrollments e where e.id = program_progress.enrollment_id and e.user_id = auth.uid())
);
drop policy if exists "progress_insert_own" on public.program_progress;
create policy "progress_insert_own" on public.program_progress for insert with check (
  exists (select 1 from public.program_enrollments e where e.id = enrollment_id and e.user_id = auth.uid())
);
drop policy if exists "progress_update_own" on public.program_progress;
create policy "progress_update_own" on public.program_progress for update using (
  exists (select 1 from public.program_enrollments e where e.id = program_progress.enrollment_id and e.user_id = auth.uid())
) with check (
  exists (select 1 from public.program_enrollments e where e.id = enrollment_id and e.user_id = auth.uid())
);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);
drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own" on public.payments for insert with check (auth.uid() = user_id);
-- update via service_role (webhook) bypass RLS; user tidak boleh update doku_status sendiri — tidak ada policy update untuk authenticated

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements for select using (auth.uid() = user_id);
-- insert/update entitlements hanya via service_role (webhook) — tidak ada policy insert untuk authenticated (dibuat admin.ts)

-- Verifikasi relasi: semua FK on delete cascade/restrict terpasang, indexes ready
