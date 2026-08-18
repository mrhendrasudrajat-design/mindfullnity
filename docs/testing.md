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
test/
  setup.ts              # Setup global: cleanup, mock IntersectionObserver, mock next/image
lib/
  landing-i18n.test.ts  # Test dictionary i18n
components/landing/
  *.test.tsx            # Test per komponen (diletakkan berdampingan dengan komponen)
```

### `test/setup.ts`

- `afterEach` → `cleanup()` dari Testing Library + `localStorage.clear()` agar antar test tidak saling kontaminasi.
- **Mock `IntersectionObserver`** → stub yang langsung memanggil callback `isIntersecting: true`, sehingga komponen `Reveal` bisa diuji tanpa browser asli.
- **Mock `next/image`** → dirender sebagai `<img>` biasa karena `next/image` membutuhkan server Next.js.

## Konvensi

- **Test file di samping kode sumber** (colocation): `navbar.tsx` → `navbar.test.tsx`.
- **Bahasa**: struktur test (describe/it) menggunakan Bahasa Indonesia agar konsisten dengan kode produk.
- **Impor eksplisit**: `import { describe, expect, it } from "vitest"` (tidak memakai globals).
- **Provider**: komponen landing yang memakai bahasa wajib dibungkus `LanguageProvider` di dalam test.
- **Interaksi**: gunakan `userEvent` (bukan `fireEvent`) untuk mensimulasikan klik/toggle.

## Cakupan

Target cakupan saat ini (dijalankan via `npm run test:coverage`):

- Statements ~96%, Branch ~90%, Lines ~99%.
- Pengecualian coverage: `lib/utils.ts`, `components/ui/**` (generated shadcn), `components/landing/reveal.tsx` (logika observer sulit diuji; sudah diuji fungsional).

## Lingkup yang Diuji

- **`landing-i18n`**: struktur dictionary ID/EN identik, tidak ada string kosong, helper `getLandingCopy` / `isLocale` / `getInitialLocale`.
- **`locale-context`**: default `id`, restore dari localStorage, toggle + persist, penanganan data rusak, error saat dipakai di luar provider.
- **`navbar`**: brand, link anchor, CTA ke `/app`, toggle bahasa mengubah copy.
- **`features` / `how-it-works` / `cta` / `footer`**: render konten sesuai locale, atribut link benar.
- **`breathing-circle` / `mood-mini-chart`**: atribut aksesibilitas (`role="img"`, `aria-hidden`).
- **`landing` (integrasi)**: halaman penuh render default ID, toggle ke EN dan kembali ke ID.
