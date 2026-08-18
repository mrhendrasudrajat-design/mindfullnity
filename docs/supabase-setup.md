# Supabase Setup & Status Proyek

Dokumen ini adalah **sumber kebenaran** untuk konfigurasi Supabase proyek Mindfulnity.
Baca ini sebelum mengerjakan apa pun yang menyentuh auth, database, atau deployment.

## Kredensial

Tersimpan di `.env.local` (sudah di-gitignore, **jangan pernah commit**):

| Variabel | Nilai | Akses |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gveibbwqlyyzokcrgqqe.supabase.co` | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` (lihat `.env.local`) | client (publik) |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` (lihat `.env.local`) | **server-only**, setara service_role — jangan pernah `NEXT_PUBLIC_` |

Template: `.env.local.example`. Format key adalah format baru Supabase (`sb_publishable_` / `sb_secret_`),
bukan `anon`/`service_role` lama.

## Arsitektur

- Auth: Supabase (email/password + Google OAuth) via `@supabase/ssr` (v0.12.x) + `@supabase/supabase-js` (v2.x)
- Next.js 16: **`proxy.ts` menggantikan middleware** — gate `/app/*` → `/auth/login`, refresh token
- DAL: `lib/supabase/dal.ts` (`requireUser()` dipanggil di `app/app/layout.tsx`)
- Data: tabel `sessions` & `mood_entries` dengan RLS `user_id = auth.uid()` + `default auth.uid()`
- Hanya `mind-draft-v1` & `mind-settings` yang tersimpan di localStorage

## Status Checklist (per 2026-08-18) — UPDATE SETELAH SETIAP PERUBAHAN

| Item | Status |
| --- | --- |
| Proyek Supabase dibuat (`gveibbwqlyyzokcrgqqe`) | ✅ Aktif (GoTrue v2.195.0) |
| `.env.local` + `.env.local.example` | ✅ Dibuat |
| Provider **Google** aktif | ✅ Aktif (verifikasi 2026-08-18 via `/auth/v1/settings`: `google: true`). Login OAuth sampai halaman Google tanpa error. Client ID & secret terpasang di dashboard |
| Google OAuth Client ID | `486047985669-5kuebifrp65l76sd8mtap6mlcatildhu.apps.googleusercontent.com` (secret di dashboard, jangan share) |
| **Migrasi SQL diterapkan** | ✅ Diterapkan via Supabase MCP (2026-08-18, migrasi `20260818113229`). Tabel `sessions` & `mood_entries` + RLS aktif. |
| Test RLS (`supabase/tests/rls.test.sql`) | ✅ Lolos (2026-08-18, via MCP). Catatan: file diperbaiki — `raise notice` di top-level dibungkus `do $$ ... $$` (valid SQL). Rollback di akhir, tanpa data sisa. |
| Konfirmasi email (mailer_autoconfirm) | ✅ **OFF** (`true` di `/auth/v1/settings`) — signup langsung login, tanpa email konfirmasi |
| Supabase MCP (opencode) | ✅ Config di `opencode.json` — aktif setelah restart opencode + OAuth |
| Test user | ✅ `test@mindfulnity.local` terdaftar (2026-08-18, id `3f6ba0ef-6bed-4dcf-8637-0d685aeaed0a`). `ui-test@mindfulnity.local` dibuat saat verifikasi browser (opsional dihapus) |

## Error yang Sudah Ditemui

- ~~`over_email_send_rate_limit` (429) pada signup~~ → **TERATASI** (2026-08-18): konfirmasi email dimatikan (`mailer_autoconfirm: true`), verifikasi via register `test@mindfulnity.local` & `ui-test@mindfulnity.local` tanpa 429
- ~~`Unsupported provider: provider is not enabled` pada Google login~~ → **TERATASI** (2026-08-18): provider Google diaktifkan di dashboard, login OAuth berhasil sampai halaman Google
- ~~`redirect_uri_mismatch` (antisipasi)~~ → **TIDAK TERJADI**: redirect URI `https://gveibbwqlyyzokcrgqqe.supabase.co/auth/v1/callback` sudah terdaftar di Google Cloud Console

## Supabase MCP (opencode)

Config di `opencode.json` (project root). Fitur: `docs, account, database, debugging, development, functions, branching`.
Setelah aktif, bisa:
- Menjalankan SQL migrasi & test RLS langsung ke proyek
- Debug query / cek isi tabel
- Verifikasi konfigurasi provider auth

## Testing Backend

- Repository (`lib/supabase/sessions.ts`, `moods.ts`) diuji dengan mock `@supabase/ssr` di `tests/lib/supabase/`
- Server actions (`signIn/signUp/signOut`) diuji via komponen form (`tests/components/app/auth/`)
- `proxy.ts` diverifikasi manual via browser (redirect `/app` → `/auth/login`)
- Logika murni (stats, player, wizard, templates) diuji tanpa mock di `tests/lib/`
