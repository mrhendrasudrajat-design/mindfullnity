# Pengujian (Unit Testing)

Dokumen ini menjelaskan setup pengujian unit untuk Mindfulnity.

## Stack

| Alat | Peran |
| --- | --- |
| [Vitest](https://vitest.dev) | Runner test (vite-native, cepat) |
| `@vitejs/plugin-react` | Transform JSX/TSX |
| `jsdom` | Environment DOM untuk menguji komponen React |
| `@testing-library/react` | Render & query komponen |
| `@testing-library/jest-dom` | Matcher tambahan (`toBeInTheDocument`, `toHaveAttribute`, dll.) |
| `@testing-library/user-event` | Simulasi interaksi pengguna (klik, ketik) |
| `@vitest/coverage-v8` | Laporan cakupan kode |

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm test` | Jalankan semua test sekali |
| `npm run test:watch` | Jalankan test dalam mode watch |
| `npm run test:coverage` | Jalankan test + laporan cakupan |

## Struktur

```
vitest.config.ts        # Konfigurasi vitest (alias @/, env jsdom, coverage)
tests/
  setup.ts              # Setup global: cleanup, mock IntersectionObserver, mock next/image
  lib/
    i18n/
      locale.test.ts    # Test helper bahasa (Locale, isLocale, getInitialLocale)
      landing.test.ts   # Test dictionary landing page
      app.test.ts       # Test dictionary aplikasi
    storage.test.ts     # Test helper localStorage
    use-local-storage.test.ts  # Test hook useLocalStorage
    format.test.ts      # Test format tanggal/durasi/sapaan
    templates.test.ts   # Test skrip 7 fase + composeSession
    stats.test.ts       # Test statistik turunan dashboard
    player.test.ts      # Test logika timer sesi (fase aktif, progres)
    wizard.test.ts      # Test state machine + validasi langkah wizard
    sound-catalog.test.ts  # Test metadata katalog suara
    supabase/
      auth-errors.test.ts   # Test pemetaan error auth → pesan ID/EN
      sessions.test.ts      # Test repository sessions (mock supabase)
      moods.test.ts         # Test repository mood_entries (mock supabase)
  components/
    providers/
      language-context.test.tsx
    landing/            # Test per komponen landing
    app/                # Test komponen aplikasi (dashboard, wizard, auth)
```

### `tests/setup.ts`

- `afterEach` → `cleanup()` dari Testing Library + `localStorage.clear()` agar antar test tidak saling kontaminasi.
- **Mock `IntersectionObserver`** → stub yang langsung memanggil callback `isIntersecting: true`, sehingga komponen `Reveal` bisa diuji tanpa browser asli.
- **Mock `next/image`** → dirender sebagai `<img>` biasa karena `next/image` membutuhkan server Next.js.

## Konvensi

- **Struktur test**: file test diletakkan di `tests/` mengikuti struktur sumbernya
  (`lib/` → `tests/lib/`, `components/landing/` → `tests/components/landing/`).
- **Bahasa**: struktur test (describe/it) menggunakan Bahasa Indonesia agar konsisten dengan kode produk.
- **Impor eksplisit**: `import { describe, expect, it } from "vitest"` (tidak memakai globals).
- **Provider**: komponen landing yang memakai bahasa wajib dibungkus `LanguageProvider` di dalam test.
- **Interaksi**: gunakan `userEvent` (bukan `fireEvent`) untuk mensimulasikan klik/toggle.

## Cakupan

Target cakupan saat ini (dijalankan via `npm run test:coverage`):

- Statements ~96%, Branch ~90%, Lines ~99%.
- Pengecualian coverage: `lib/utils.ts`, `components/ui/**` (generated shadcn), `components/landing/reveal.tsx` (logika observer sulit diuji; sudah diuji fungsional).

## Lingkup yang Diuji

- **`i18n/locale`**: `isLocale` / `getInitialLocale` / `localeLabel` / `languageCode`.
- **`i18n/landing`**: struktur dictionary ID/EN identik, tidak ada string kosong, helper `getLandingCopy`.
- **`i18n/app`**: struktur dictionary ID/EN identik, jumlah tujuan (6), guide (4), suara (5), level mood (5), nama fase (7).
- **`storage`**: round-trip baca/tulis, fallback saat data rusak, stabilitas snapshot, helper settings, SSR-safe.
- **`use-local-storage`**: inisialisasi, persistensi, updater fungsi, reset, re-render antar hook (sinkron).
- **`format`**: durasi (ID/EN), jam `mm:ss`, tanggal (Intl), sapaan per jam, kunci tanggal.
- **`templates`**: 7 fase dalam urutan kanonik untuk 6 tujuan × 2 bahasa, tanpa placeholder tersisa,
  interpolasi anchor, intro guide, fallback default, `composeSession` untuk semua kombinasi tujuan × guide.
- **`stats`**: total menit, jumlah sesi, konsistensi (hari aktif 7 hari), urut sesi terbaru.
- **`player`**: pemetaan fase aktif berdasarkan waktu, progres cincin (clamp 0–1).
- **`wizard`**: validasi tiap langkah (`stepCanContinue`), `canCompose`, resume draft.
- **`sound-catalog`**: semua entri punya label & kategori valid, volume default dalam rentang.
- **`supabase/auth-errors`**: pemetaan kode error (confirm-email, invalid login, callback, dll.) ke pesan ID/EN.
- **`supabase/sessions` & `moods`** (mock `@supabase/ssr`): query builder dipanggil dengan argumen
  benar (`from`, `select`, `insert`, `upsert`, `eq`, `order`), mapping baris → domain, error dilempar.
- **`locale-context`**: default `id`, restore dari localStorage, toggle + persist, penanganan data rusak, error saat dipakai di luar provider.
- **`navbar`**: brand, link anchor, CTA ke `/app`, toggle bahasa mengubah copy.
- **`features` / `how-it-works` / `cta` / `footer`**: render konten sesuai locale, atribut link benar.
- **`breathing-circle`**: atribut aksesibilitas (`role="img"`, `aria-hidden`).
- **`landing` (integrasi)**: halaman penuh render default ID, toggle ke EN dan kembali ke ID.
- **Komponen aplikasi**: auth form (submit + error), dashboard (empty state & data), wizard steps
  (pilih tujuan/guide memungkinkan lanjut), mood picker (seleksi level).
