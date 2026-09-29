# Arsitektur Aplikasi

> **Baca dulu**: konfigurasi & status Supabase (kredensial, checklist migrasi, provider, error
> yang ditemui) ada di [docs/supabase-setup.md](./supabase-setup.md) — perbarui dokumen itu
> setiap ada perubahan backend.

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 16.3.0 (App Router) |
| UI | React 19.2, TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Komponen | shadcn/ui v4 (`base-vega`) + `@base-ui/react` |
| Ikon | `@phosphor-icons/react` |
| Font | Outfit (heading), Montserrat (sans), Geist (mono) |
| Backend | Supabase (Auth + Postgres + RLS) via `@supabase/ssr` |
| Grafik | Recharts |

## Struktur Direktori

```
app/
  layout.tsx          # Root layout: register font + provider global
  page.tsx            # Landing page (/)
  globals.css         # Theme (light/dark, sidebar, chart) + Tailwind
  auth/
    login/page.tsx    # Halaman login (/auth/login)
    signup/page.tsx   # Halaman daftar (/auth/signup)
    callback/route.ts # Callback OAuth/magic link (tukar kode sesi)
  app/
    layout.tsx        # Shell aplikasi (protected) + navigasi
    page.tsx          # Dashboard (/app)
    session/
      new/page.tsx    # Wizard buat sesi (/app/session/new)
      [id]/page.tsx   # Halaman sesi + pemutar + check-in (/app/session/:id)
    sounds/page.tsx   # Katalog suara relaksasi (/app/sounds)
    mood/page.tsx     # Mood tracker (/app/mood)
    program/
      page.tsx        # Katalog 7/21/90 (`/app/program`)
      [slug]/page.tsx # Detail program + grid hari (`/app/program/:slug`)
      [slug]/checkout/page.tsx # Checkout DOKU (`/app/program/:slug/checkout`)
      [slug]/day/[n]/page.tsx # Hari ke-N (`/app/program/:slug/day/:n`)
  api/
    tts/route.ts      # TTS (protected)
    doku/webhook/route.ts # Webhook DOKU (publik, verify signature)
proxy.ts              # (pengganti middleware Next 16) gate /app + refresh token (bypass /api/doku)
supabase/
  migrations/         # SQL: sessions, mood_entries, programs, program_days, enrollments, progress, payments, entitlements
components/
  ui/                 # Komponen shadcn/ui
  providers/
    language-context.tsx # LanguageProvider (shared landing + app)
  landing/            # Komponen landing page (navbar, hero, dsb.)
    landing.tsx       # Komposisi halaman penuh + LanguageProvider
    navbar.tsx        # Navbar sticky + toggle bahasa ID/EN
    hero.tsx          # Headline + badge + lingkaran pernapasan
    breathing-circle.tsx  # Visual cincin bernapas (animasi CSS)
    features.tsx      # 3 kartu fitur (grafik mood via recharts)
    how-it-works.tsx  # 3 langkah cara kerja
    cta.tsx           # Ajakan mulai
    footer.tsx        # Footer minimal + badge privasi
    logo.tsx          # Logo mark + wordmark
    reveal.tsx        # Scroll-reveal via IntersectionObserver
  auth/               # Form login/signup + tombol Google
  app/
    shell/            # AppShell, navbar atas, bottom nav mobile
    dashboard/        # Sapaan, kartu statistik, quick actions, arsip, mini-chart
    wizard/           # 5 langkah wizard + compose + draft banner
    session/          # Sesi siap, timer cincin, check-in
    sounds/           # Kartu suara + pemutar
    mood/             # Mood picker, grafik 30 hari
lib/
  i18n/               # Dictionary ID/EN + helper bahasa
    locale.ts         # Tipe Locale + isLocale/getInitialLocale
    landing.ts        # Dictionary landing page (ID/EN) + getLandingCopy
    app.ts            # Dictionary aplikasi (auth, dashboard, wizard, sesi, suara, mood)
  storage.ts          # Helper localStorage SSR-safe + STORAGE_KEYS + sinkron antar-tab
  use-local-storage.ts # Hook React useLocalStorage (useSyncExternalStore)
  templates.ts        # Skrip 7 fase per tujuan (ID + EN) + composeSession
  format.ts           # Format tanggal/durasi/sapaan
  stats.ts            # Statistik turunan (total menit, sesi, konsistensi)
  player.ts           # Logika timer sesi (fase aktif, progres cincin)
  sound-catalog.ts    # Metadata suara (id, label, kategori, volume default)
  sound-engine.ts     # Generator suara ambien (Web Audio API, prosedural)
  wizard.ts           # State machine wizard + validasi tiap langkah
  supabase/
    client.ts         # Koneksi browser (@supabase/ssr)
    server.ts         # Koneksi server (cookie session)
    dal.ts            # Data Access Layer: getUser / requireUser (protected)
    auth.ts           # Server actions: signIn, signUp, signOut
    auth-errors.ts    # Pemetaan error auth ke pesan ID/EN
    sessions.ts       # Repository tabel sessions
    moods.ts          # Repository tabel mood_entries
    actions.ts        # Server actions CRUD aplikasi (create session, check-in, mood)
public/

tests/
  setup.ts            # Setup global vitest (cleanup, mock IO, recharts, next/image)
  lib/                # Test unit logika murni
  components/         # Test komponen (landing, providers, app)
```

## Routing

| URL | Fungsi |
| --- | --- |
| `/` | Landing page (marketing, publik) |
| `/auth/login` | Login (email/password + Google) |
| `/auth/signup` | Daftar akun |
| `/auth/callback` | Callback OAuth/magic link (tukar kode → sesi) |
| `/app` | Dashboard aplikasi (protected) |
| `/app/session/new` | Wizard buat sesi (5 langkah) |
| `/app/session/:id` | Hasil sesi + pemutar meditasi + check-in |
| `/app/sounds` | Suara relaksasi |
| `/app/mood` | Mood tracker |
| `/api/tts` | POST (protected): sintesis suara panduan via OpenRouter |
| `/app/program` | Katalog program 7/21/90 (paywall DOKU) |
| `/app/program/:slug` | Detail program + progress harian (unlock bertahap) |
| `/app/program/:slug/checkout` | Checkout DOKU Checkout (mock jika tanpa key) |
| `/app/program/:slug/day/:n` | Hari ke-N — 1 sesi 7 fase, terhubung `program_progress.session_id → sessions.id` |
| `/api/doku/webhook` | POST (publik): notifikasi DOKU, verify HMAC-SHA256, idempotent `doku_invoice_id` |

## Landing Page (Sudah Diimplementasikan)

Landing page di `/` dibangun dengan brand **Mindfulnity** (adaptasi prinsip tenang & minimalis).

- **Bahasa**: dictionary `lib/i18n/` (ID default + EN), dikelola `LanguageProvider`
  (`components/providers/language-context.tsx`) via `useSyncExternalStore` + persistensi di
  `localStorage` (`mind-settings.language`).
- **Animasi**: `breath` (lingkaran napas) & `fade-up` didefinisikan di `app/globals.css`
  lewat blok `@theme`; scroll-reveal via `components/landing/reveal.tsx`
  (IntersectionObserver). Semua animasi dihargai `prefers-reduced-motion`.
- **Aset visual**: foto placeholder dari `picsum.photos` (diizinkan via `next.config.ts`
  `images.remotePatterns`); kartu mood memakai bar chart recharts (7 hari).
- **CTA**: "Mulai" menuju `/app` (diarahkan ke `/auth/login` bila belum login via `proxy.ts`).

## Dokumentasi Terkait

- [Setup developer & troubleshooting](./development.md) — clone → setup → dev
- [Deploy ke Vercel](./deployment.md) — env prod, checklist Supabase & Google OAuth
- [Supabase setup](./supabase-setup.md) — sumber kebenaran kredensial & migrasi

## Pengujian

Setup unit testing (Vitest + Testing Library) didokumentasikan di
[docs/testing.md](./testing.md). Test file diletakkan di `tests/` mengikuti struktur sumbernya.

## Autentikasi & Keamanan

- **Supabase Auth**: email/password + Google OAuth. Sesi dikelola `@supabase/ssr`
  (cookie httpOnly + refresh otomatis di `proxy.ts`).
- **`proxy.ts`** (pengganti middleware di Next.js 16): memperbarui token sesi setiap
  request, mengalihkan `/app/*` tanpa login ke `/auth/login`, dan `/auth/*` dengan sesi
  aktif ke `/app`.
- **DAL** (`lib/supabase/dal.ts`): `requireUser()` dipanggil di layout `/app` — satu
  titik penjaga untuk seluruh halaman protected.
- **RLS (Row Level Security)**: tabel `sessions` & `mood_entries` hanya bisa dibaca/ditulis
  oleh pemiliknya (`user_id = auth.uid()`), diperkuat `default auth.uid()` saat insert.
- Kredensial: `.env.local` (URL + publishable key client; `OPENROUTER_API_KEY` server-only
  untuk narasi AI & TTS; `DOKU_CLIENT_ID/SECRET_KEY/API_URL` server-only untuk checkout;
  `FX_IDR_PER_USD` untuk EN/USD display; `SUPABASE_SECRET_KEY` **dipakai** `lib/supabase/admin.ts` untuk webhook DOKU — lihat `.env.local.example`).

## State & Persistensi

Sesi & mood tersimpan di **Supabase Postgres** (per akun). Yang tersimpan di `localStorage`
via `lib/storage.ts` (SSR-safe, cache snapshot, sinkron antar-tab):

| Key | Struktur | Deskripsi |
| --- | --- | --- |
| `mind-draft-v1` | Objek draft wizard | Resume pembuatan sesi |
| `mind-settings` | `{ language, volume, voice }` | Preferensi pengguna (suara panduan on/off) |

Skema `sessions`/`mood_entries` ada di `supabase/migrations/20260818_init.sql` (+ `20260826_relational_fix.sql`).
Skema paywall & program ada di `supabase/migrations/20260929_billing_programs.sql`:
`programs` (7/21/90, `price_idr` 19k/49k/99k) 1--N `program_days` (118 rows, `goal` + `phases` JSONB),
`program_enrollments` (user→program, `current_day` unlock, `unique where status='active'`),
`program_progress` (`enrollment_id` FK + `session_id` FK `sessions.id` SET NULL — **relasi program→session**),
`payments` (DOKU `doku_invoice_id` unique, `amount` IDR + `display_*` lokal), `entitlements` (user→program, `payment_id` FK).
Semua RLS `user_id=auth.uid()` (katalog `programs`/`program_days` `authenticated` read), webhook via `lib/supabase/admin.ts` service_role.

Skema `Session` (adaptasi model sesi Wavr):

```
{
  id: string
  createdAt: string        // ISO
  title: string
  goal: GoalId             // tidur, stres, fokus, percaya-diri, relaksasi, energi
  guide: GuideId           // mentor, teman, orang-tua, future-self
  soundMix: { nature: string[], instruments: string[] }
  durationMin: number
  phases: Phase[]          // 7 fase: { id, title, lines[] }
  moodBefore?: 1-5
  moodAfter?: 1-5
  reflection?: string
  integrationAction?: string
}
```

Derived data: total menit, jumlah sesi, dan konsistensi dihitung dari `mind-sessions`
(kini dibaca dari tabel Supabase `sessions` via `lib/supabase/sessions.ts` + `lib/stats.ts`).

## Internasionalisasi

- Dictionary ringan di `lib/i18n/`: `locale.ts` (tipe + helper), `landing.ts` (landing page),
  `app.ts` (dictionary aplikasi: auth, dashboard, wizard, sesi, check-in, suara, mood)
- React Context (`LanguageProvider`) mengelola bahasa aktif — dipakai landing & aplikasi
- Preferensi bahasa tersimpan di `localStorage` (`mind-settings.language`)
- Template skrip 7 fase di `lib/templates.ts` memiliki varian ID dan EN

## Audio (Suara Relaksasi)

- Dibangkitkan secara prosedural via **Web Audio API** (`lib/sound-engine.ts`)
- Tidak memerlukan file audio eksternal; opsi volume per suara
- Suara alam: hujan, laut, hutan, angin, malam (+ instrumen: pad lembut, kotak musik)
- Metadata di `lib/sound-catalog.ts` — menambah suara baru cukup 1 entri di katalog +
  generator di engine (+ label di dictionary)
- `stop()` memutus semua node (source/filter/gain/osilator, try/catch) dan menutup
  `AudioContext` saat idle; `AppShell` memanggil `stopAll()` setiap ganti route
  (BGM tidak pernah bocor ke halaman lain)

## Suara Panduan (TTS)

- **Sumber**: OpenRouter `/api/v1/audio/speech`, model `fish-audio/s2.1-pro-free:free`
  (gratis, 83 bahasa auto-detect termasuk Indonesia), output mp3
- **Server**: `lib/tts.ts` + route `app/api/tts/route.ts` (guard `requireUser()`,
  batas panjang teks, error mapping non-200)
- **Client**: `lib/voice-player.ts` — antrian `HTMLAudioElement` (pause/resume/stop,
  prefetch fase berikutnya, cache per teks, skip segmen gagal)
- Toggle "Panduan suara" di pemutar sesi; preferensi di `mind-settings.voice`
- **Input TTS = `phase.lines` dari sesi** — teks yang sama persis dengan yang ditampilkan
  (narasi AI = placeholder = suara). Tidak pernah mengirim email/mood/refleksi.

## Pembuatan Sesi (Narasi AI + Fallback Template)

- Saat "Compose sesi saya", server action `generateSessionAction` memanggil **LLM gratis
  via OpenRouter** (`lib/ai-script.ts`, model `z-ai/glm-5.2:free` dengan fallback routing)
  dengan input = pilihan wizard (goal, guide, durasi, bahasa, nickname, anchor)
- LLM mengembalikan JSON 7 fase → disanitasi ketat (id valid, urutan `PHASE_IDS`,
  batas baris) → disimpan ke `sessions.phases`
- **Fallback otomatis** ke `composeSession()` (template lokal di `lib/templates.ts`)
  saat API key kosong, timeout, respons tidak valid — sesi tidak pernah gagal,
  prinsip anti-tekanan
- Hanya data pilihan sesi yang dikirim ke LLM/TTS; data akun & check-in tidak pernah

## Paywall & Program 7/21/90

- **Katalog & harga:** `lib/programs.ts` + `supabase/migrations/20260929_billing_programs.sql` seed 7/21/90 (`price_idr` 19k/49k/99k); `lib/pricing.ts` `priceFor(locale, priceIdr)` — `ID→IDR` `formatIDR`, `EN→USD` `formatUSD` via `FX_IDR_PER_USD=16500` (A), `dokuAmountFor()` selalu IDR untuk settlement DOKU.
- **Checkout:** `lib/payments/doku.ts` (`isDokuConfigured`, `createDokuCheckout` HMAC-SHA256 `ClientId+RequestId+Timestamp+payload`, mock grant jika tanpa key), `lib/supabase/actions.ts` `createCheckoutAction` + `completeProgramDayAction` (upsert `program_progress` + advance `current_day`), `lib/supabase/admin.ts` service_role untuk grant.
- **Webhook:** `app/api/doku/webhook/route.ts` publik (bypass `proxy.ts`), verify `X-DOKU-Signature` timing-safe, idempotent `doku_invoice_id`, upsert `entitlements` + `program_enrollments`.
- **Entitlement:** `lib/payments/entitlement.ts` `hasEntitlement` RLS user-only; paywall di `app/app/program/[slug]/page.tsx` (redirect `checkout` jika belum), unlock `isDayUnlocked` `day <= currentDay`.
- **Relasi DB terhubung:** `programs`──<`program_days`/`payments`/`entitlements`, `program_enrollments`──<`program_progress`──>`sessions` (`session_id` SET NULL), `entitlements.payment_id→payments.id` — cascade/restrict menjaga integritas (hapus user cascade, hapus program restrict jika ada enrollment/payment).

## Pola

- Komponen interaktif memakai `"use client"`
- Alias path `@/*` → root proyek
- Layout bertipe memakai helper global `LayoutProps<'/path'>`
- Data layer memisahkan logika murni (`lib/*`) dari akses data (`lib/supabase/*`) agar
  mudah diuji tanpa koneksi nyata (mock `@supabase/ssr`)
