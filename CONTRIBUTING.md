# Contributing — Mindfulnity

## Workflow

1. Clone & setup: `npm run setup` → isi `.env.local` → `npm run validate-env` (lihat `README.md`, `docs/development.md`).
2. Buat branch: `git checkout -b feat/nama-fitur` (atau `fix/...`).
3. Koding — ikuti pola `docs/architecture.md` (alias `@/*`, `LayoutProps`, `"use client"` untuk interaktif).
4. Verifikasi wajib sebelum commit (lihat `AGENTS.md`):
   ```bash
   npm test
   npm run lint
   npm run build
   ```
5. Commit, push, buat PR ke `main`.

## Aturan Penting

- **Next.js 16:** Middleware = `proxy.ts` di root — jangan buat `middleware.ts`/`middleware.js` (lihat `AGENTS.md`, `proxy.ts:1`).
- **Env:** Jangan commit `.env.local` (sudah `.gitignore`). Update `.env.local.example` + `docs/supabase-setup.md` jika tambah var.
- **Supabase:** Migrasi di `supabase/migrations/` — jangan edit yang sudah ter-apply; buat file baru `YYYYMMDD_desc.sql`. Update `docs/supabase-setup.md` checklist.
- **i18n:** Tambah key di `lib/i18n/landing.ts` & `lib/i18n/app.ts` (ID + EN identik bentuknya).
- **Testing:** Tambah test di `tests/` mirror sumbernya (lihat `docs/testing.md`).

## Commit Message

Gunakan `feat:`, `fix:`, `docs:`, `chore:` prefix. Contoh: `feat: wizard step 3 validation`.

## Docs

- `README.md` — quick start
- `docs/architecture.md` — arsitektur & pola
- `docs/development.md` — panduan developer
- `docs/deployment.md` — deploy Vercel
- `docs/supabase-setup.md` — sumber kebenaran Supabase
