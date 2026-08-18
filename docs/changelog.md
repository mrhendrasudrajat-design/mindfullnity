# Changelog

Semua perubahan penting pada proyek dicatat di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan semantik versi.

## [Unreleased]

### Ditambahkan

- Landing page **Mindfulnity** di `/`:
  - Navbar sticky (logo, tautan #fitur & #cara-kerja, toggle bahasa, CTA "Mulai")
  - Hero split-screen dengan visual lingkaran pernapasan beranimasi + badge "Tersimpan di browser ini"
  - Section fitur (3 kartu: Meditasi Terpandu, Suara Relaksasi, Mood Tracker)
  - Section cara kerja (3 langkah), CTA akhir, dan footer minimal
  - Dictionary i18n `lib/landing-i18n.ts` (ID default + EN) + `LanguageProvider`
    (tersimpan di `mind-settings.language` via localStorage)
  - Animasi `breath` & `fade-up` di `app/globals.css`, scroll-reveal via IntersectionObserver
  - Metadata & `lang="id"` di `app/layout.tsx`; remote image `picsum.photos` di `next.config.ts`
- Unit testing dengan **Vitest + Testing Library** (`vitest.config.ts`, `test/setup.ts`):
  - 11 test file, 37 test (passing), coverage ~96% statements / ~99% lines
  - Script `npm test`, `npm run test:watch`, `npm run test:coverage`
  - Dokumentasi di `docs/testing.md`

### Rencana

Fondasi aplikasi mindfulness (referensi alur: Wavr, disesuaikan untuk MVP lokal):

- Landing page tenang & minimalis di `/`
- Dashboard-first di `/app`: sapaan, statistik (total menit, sesi, konsistensi), arsip sesi, quick actions
- Wizard buat sesi 5 langkah di `/app/session/new`:
  - Personal start → Tujuan (6 kartu) → Guide → Bentuk suara → Anchor (opsional)
  - Draft otomatis tersimpan antar langkah (resume)
  - Animasi compose 5 tahap
- Halaman sesi `/app/session/:id`: teks 7 fase (template ID/EN), timer cincin, suara ambien
- Check-in setelah sesi: mood sebelum/sesudah, refleksi, aksi integrasi (opsional)
- Suara relaksasi di `/app/sounds` (Web Audio API, tanpa file eksternal)
- Mood tracker di `/app/mood`: entri emoji 5 level + grafik 30 hari (SVG)
- Toggle bahasa Indonesia / English (default Indonesia, persist di localStorage)
- Persistensi data via localStorage: `mind-draft-v1`, `mind-sessions`, `mind-mood`, `mind-settings`

### Roadmap (setelah MVP)

- Program berjenjang 7/21/90 hari dengan progres per hari (seperti Wavr)
- Autentikasi + sinkronisasi cloud (Supabase)
- Meditasi terpandu bersuara / voice production
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
