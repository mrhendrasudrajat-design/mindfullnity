# Changelog

Semua perubahan penting pada proyek dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan semantik versi.

## [Unreleased]

### Ditambahkan

- **Narasi AI per sesi** (via OpenRouter, model gratis):
  - `lib/ai-script.ts` — prompt builder + call LLM (`z-ai/glm-5.2:free`, fallback routing
    `nemotron-3-super:free` / `minimax-m2.7:free`) → JSON 7 fase; parse & sanitasi ketat
    (id valid, urutan PHASE_IDS, batas panjang baris); **fallback otomatis ke template lokal**
    (`composeSession`) saat API key kosong, timeout, atau respons tidak valid — sesi tidak pernah gagal
  - `lib/ai-config.ts` — konstanta model, `isAiConfigured()`, override via env
  - Server action `generateSessionAction` (generate + simpan + revalidate); wizard kini
    menulis narasi AI saat "Compose sesi saya" dengan indikator "Menyusun narasi AI…"
  - **Privasi**: LLM hanya menerima pilihan sesi (goal, guide, durasi, bahasa, nickname,
    anchor) — bukan email/mood/refleksi
- **Meditasi terpandu bersuara (TTS)** via OpenRouter (`fish-audio/s2.1-pro-free:free`, gratis,
  83 bahasa termasuk Indonesia, auto-detect):
  - `lib/tts.ts` — client server ke `/api/v1/audio/speech` (mp3), error mapping, batas teks
  - `app/api/tts/route.ts` — POST guard `requireUser()` + validasi
  - `lib/voice-player.ts` — antrian `HTMLAudioElement` (pause/resume/stop, prefetch fase
    berikutnya, cache per teks, fallback senyap saat gagal)
  - Toggle "Panduan suara" di pemutar sesi (default on, persist `mind-settings.voice`);
    suara membacakan **teks yang sama persis** dengan yang ditampilkan (narasi AI = placeholder)
  - **Pre-warm TTS**: halaman "Sesi siap" me-prefetch audio semua 7 fase (paralel batch 3–4)
    sebelum sesi dimulai; prefetch semua sisa fase saat playback berjalan; **cache server
    in-memory LRU** di `/api/tts` (replay instan, hemat kuota) — suara panduan mulai
    bersamaan BGM; indikator "Menyiapkan suara…" saat audio belum siap
- **Relasi database `mood_entries ↔ sessions`** (migrasi `20260826_relational_fix.sql`):
  - Kolom `session_id` FK (cascade) — mood check-in tertelusur ke sesi asalnya
  - Uniqueness baru: check-in maks 1/sesi (`user_id, session_id`), manual maks 1/hari
    (partial unique `(user_id, date) where source='manual'`) — **2+ sesi/hari tidak lagi
    saling menimpa mood check-in** (perbaikan bug `unique(user_id,date)` lama)
  - `updated_at` + trigger `set_updated_at()` di kedua tabel; `comment on` semantik kolom
  - Check-in kini 1 server action (`saveCheckinAction` menulis sesi + mood sekaligus)
- **Perbaikan engine suara ambien** (`lib/sound-engine.ts`): stop keras (disconnect semua
  node + try/catch), `musicBox` reset step & melacak osilator aktif, context ditutup saat
  idle; **pengaman global** di `AppShell` (`usePathname` → stop semua suara/voice tiap
  navigasi) — BGM tidak lagi bocor ke dashboard
- Unit test baru: `tests/lib/{ai-script,tts,voice-player}.test.ts` (mock fetch/Audio);
  update `tests/lib/supabase/moods.test.ts` (semantik unique baru); test RLS diperluas
  (relasi session_id, unique check-in/manual, cascade) — 167 test, semua passing
- Env baru di `.env.local.example`: `OPENROUTER_API_KEY` (server-only),
  opsional `OPENROUTER_SCRIPT_MODEL`, `OPENROUTER_TTS_VOICE`
- Landing page **Mindfulnity** di `/`:
  - Navbar sticky (logo, tautan #fitur & #cara-kerja, toggle bahasa, CTA "Mulai")
  - Hero split-screen dengan visual lingkaran pernapasan beranimasi + badge privasi
  - Section fitur (3 kartu: Meditasi Terpandu, Suara Relaksasi, Mood Tracker) dengan
    grafik mood bar chart (recharts) di kartu Mood Tracker
  - Section cara kerja (3 langkah), CTA akhir, dan footer minimal
  - `LanguageProvider` (tersimpan di `mind-settings.language` via localStorage)
  - Animasi `breath` & `fade-up` di `app/globals.css`, scroll-reveal via IntersectionObserver
  - Metadata & `lang="id"` di `app/layout.tsx`; remote image `picsum.photos` di `next.config.ts`
- Unit testing dengan **Vitest + Testing Library** (`vitest.config.ts`, `tests/setup.ts`):
  - Script `npm test`, `npm run test:watch`, `npm run test:coverage`
  - Dokumentasi di `docs/testing.md`
- Fondasi lib aplikasi:
  - `lib/i18n/` — restrukturisasi: `locale.ts` (tipe `Locale` + helper), `landing.ts`
    (dictionary landing, dipindah dari `lib/landing-i18n.ts`), `app.ts` (dictionary
    baru untuk dashboard, wizard, sesi, check-in, suara, mood — ID/EN)
  - `lib/storage.ts` — helper localStorage SSR-safe, `STORAGE_KEYS`, cache snapshot
    stabil untuk `useSyncExternalStore`, sinkron antar-tab via event `storage`,
    helper `readSettings` / `writeSettings`
  - `lib/use-local-storage.ts` — hook `useLocalStorage<T>` (nilai, setter, reset)
  - `lib/format.ts` — `formatDuration`, `formatClock`, `formatDate`, `formatShortDate`,
    `greetingForHour`, `dateKey` (ID/EN)
  - `lib/templates.ts` — tipe `Session`/`GoalId`/`GuideId`/`Phase`, skrip 7 fase
    lengkap untuk 6 tujuan (ID + EN), intro 4 persona guide, `buildPhases` dan
    `composeSession` dengan interpolasi anchor + fallback default
- `locale-context` dipindah ke `components/providers/language-context.tsx` (shared landing + app)
- Hapus komponen tak terpakai `mood-mini-chart.tsx` + test-nya
- **Autentikasi & backend Supabase**:
  - `@supabase/supabase-js` + `@supabase/ssr`; env `.env.local` (publishable key client,
    secret key server-only)
  - `proxy.ts` (pengganti middleware Next 16): refresh token + gate `/app/*` → `/auth/login`
  - Halaman `/auth/login` & `/auth/signup` (email/password + Google OAuth), callback route,
    DAL `requireUser()`, server actions `signIn/signUp/signOut`
  - Migrasi SQL `supabase/migrations/20260818_init.sql`: tabel `sessions` & `mood_entries`
    + RLS (`user_id = auth.uid()`, default `auth.uid()` saat insert)
- **Aplikasi `/app` (protected)**:
  - Shell: navbar atas (email + toggle bahasa + keluar) + bottom nav mobile
  - Dashboard: sapaan, statistik (total menit/sesi/konsistensi 7 hari), quick actions,
    arsip sesi, mini-chart mood 7 hari
  - Wizard 5 langkah (draft di `mind-draft-v1`, banner resume, animasi compose) →
    simpan ke Supabase
  - Halaman sesi: timer cincin + teks 7 fase + suara ambien; check-in (mood/refleksi/
    aksi integrasi) → update `sessions` + upsert `mood_entries`
  - Sounds: `lib/sound-engine.ts` (Web Audio prosedural) + `lib/sound-catalog.ts`
  - Mood: picker 5 level + catatan + grafik 30 hari (recharts)
- Unit test baru: `tests/lib/i18n/{locale,landing,app}.test.ts`, `storage`,
  `use-local-storage`, `format`, `templates` (89 test, semuanya passing)
- **Supabase MCP** terhubung via `opencode.json` (fitur: docs, account, database,
  debugging, development, functions, branching) — lihat `docs/supabase-setup.md`
- Dokumentasi konteks AI: `docs/supabase-setup.md` (kredensial, status checklist,
  error yang ditemui)

### Roadmap (setelah MVP)

- Program berjenjang 7/21/90 hari dengan progres per hari (seperti Wavr)
- Notifikasi / reminder harian
- PWA / offline
- Monetisasi (premium)

## [0.1.0] - 2026-08-13

### Ditambahkan

- Starter Next.js 16.3.0 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 dengan theme light/dark (base color `mist`)
- shadcn/ui v4 (style `base-vega`) + `@base-ui/react`
- Ikon `@phosphor-icons/react`
- Font: Outfit, Montserrat, Geist
- Komponen `Button` (variants: default, outline, secondary, ghost, destructive, link)
- Helper `cn()` di `lib/utils.ts`
- Dokumentasi `docs/architecture.md`, `docs/changelog.md`, dan `docs/user-flow.md`
