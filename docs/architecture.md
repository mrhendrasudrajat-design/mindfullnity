# Arsitektur Aplikasi

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 16.3.0 (App Router) |
| UI | React 19.2, TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Komponen | shadcn/ui v4 (`base-vega`) + `@base-ui/react` |
| Ikon | `@phosphor-icons/react` |
| Font | Outfit (heading), Montserrat (sans), Geist (mono) |

## Struktur Direktori (Rencana)

```
app/
  layout.tsx          # Root layout: register font + provider global
  page.tsx            # Landing page (/)
  globals.css         # Theme (light/dark, sidebar, chart) + Tailwind
  app/
    layout.tsx        # Shell aplikasi mindfulness (navigasi)
    page.tsx          # Dashboard (/app)
    session/
      new/page.tsx    # Wizard buat sesi (/app/session/new)
      [id]/page.tsx   # Halaman sesi + pemutar + check-in (/app/session/:id)
    sounds/page.tsx   # Katalog suara relaksasi (/app/sounds)
    mood/page.tsx     # Mood tracker (/app/mood)
components/
  ui/                 # Komponen shadcn/ui
  landing/            # Komponen landing page (navbar, hero, dsb.)
    landing.tsx       # Komposisi halaman penuh + LanguageProvider
    navbar.tsx        # Navbar sticky + toggle bahasa ID/EN
    hero.tsx          # Headline + badge privasi + lingkaran pernapasan
    breathing-circle.tsx  # Visual cincin bernapas (animasi CSS)
    features.tsx      # 3 kartu fitur
    mood-mini-chart.tsx  # Mini chart mood 5 level (SVG)
    how-it-works.tsx  # 3 langkah cara kerja
    cta.tsx           # Ajakan mulai
    footer.tsx        # Footer minimal + badge privasi
    logo.tsx          # Logo mark + wordmark
    locale-context.tsx# Context bahasa (LanguageProvider)
    reveal.tsx        # Scroll-reveal via IntersectionObserver
  app/
    dashboard/        # Kartu statistik, quick actions, mini-chart
    wizard/           # 5 langkah wizard buat sesi
    session/          # Timer cincin, phase reader, check-in, sound mixer
    mood/             # Mood picker, mood chart (SVG)
    sounds/           # Kartu & pemutar suara
lib/
  i18n/               # Dictionary ID/EN + provider bahasa
  landing-i18n.ts     # Dictionary landing page (ID/EN) + helper
  storage.ts          # Helper localStorage
  use-local-storage.ts # Hook React untuk localStorage
  templates.ts        # Template skrip 7 fase per tujuan (ID + EN)
  sound-engine.ts     # Generator suara ambien (Web Audio API)
  format.ts           # Format tanggal/durasi
  utils.ts            # Helper cn()
public/

test/
  setup.ts            # Setup global vitest (cleanup, mock IO & next/image)
```

## Routing

| URL | Fungsi |
| --- | --- |
| `/` | Landing page (marketing) |
| `/app` | Dashboard aplikasi |
| `/app/session/new` | Wizard buat sesi (5 langkah) |
| `/app/session/:id` | Hasil sesi + pemutar meditasi + check-in |
| `/app/sounds` | Suara relaksasi |
| `/app/mood` | Mood tracker |

## Landing Page (Sudah Diimplementasikan)

Landing page di `/` dibangun dengan brand **Mindfulnity** (adaptasi prinsip tenang & minimalis).

- **Bahasa**: dictionary `lib/landing-i18n.ts` (ID default + EN), dikelola `LanguageProvider`
  (`components/landing/locale-context.tsx`) via `useSyncExternalStore` + persistensi di
  `localStorage` (`mind-settings.language`).
- **Animasi**: `breath` (lingkaran napas) & `fade-up` didefinisikan di `app/globals.css`
  lewat blok `@theme`; scroll-reveal via `components/landing/reveal.tsx`
  (IntersectionObserver). Semua animasi dihargai `prefers-reduced-motion`.
- **Aset visual**: foto placeholder dari `picsum.photos` (diizinkan via `next.config.ts`
  `images.remotePatterns`); kartu mood memakai mini-chart SVG asli.
- **CTA**: "Mulai" menuju `/app` (route aplikasi, belum diimplementasikan).

## Pengujian

Setup unit testing (Vitest + Testing Library) didokumentasikan di
[docs/testing.md](./testing.md). Test file dicolocate dengan sumbernya
(`navbar.tsx` → `navbar.test.tsx`).

## State & Persistensi (MVP, tanpa auth)

Data disimpan di `localStorage` via `lib/storage.ts` + hook `useLocalStorage`.

| Key | Struktur | Deskripsi |
| --- | --- | --- |
| `mind-draft-v1` | Objek draft wizard | Resume pembuatan sesi antar langkah |
| `mind-sessions` | `Session[]` | Riwayat sesi lengkap (fase, mood, refleksi, aksi integrasi) |
| `mind-mood` | `{ date, mood: 1-5, note? }[]` | Entri mood harian (dari check-in + manual) |
| `mind-settings` | `{ language, volume }` | Preferensi pengguna |

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

Derived data: total menit, jumlah sesi, dan konsistensi dihitung dari `mind-sessions`.

## Internasionalisasi

- Dictionary ringan di `lib/i18n/` (ID default + EN)
- React Context (`LanguageProvider`) mengelola bahasa aktif
- Preferensi bahasa tersimpan di `localStorage`
- Template skrip 7 fase di `lib/templates.ts` memiliki varian ID dan EN

## Audio (Suara Relaksasi)

- Dibangkitkan secara prosedural via **Web Audio API** (`lib/sound-engine.ts`)
- Tidak memerlukan file audio eksternal; opsi volume per suara
- Suara alam: hujan, laut, hutan, angin, malam (+ instrumen opsional)

## Pembuatan Sesi (Tanpa AI)

- Tidak ada backend/AI: sesi "disusun" dari template lokal
- `lib/templates.ts` menyediakan skrip 7 fase per tujuan (ID + EN)
- Persona guide memengaruhi nada bahasa teks; anchor pengguna disisipkan ke teks
- Data sepenuhnya lokal; tanpa auth, billing, atau produksi suara panduan

## Pola

- Komponen interaktif memakai `"use client"`
- Alias path `@/*` → root proyek
- Layout bertipe memakai helper global `LayoutProps<'/path'>`
