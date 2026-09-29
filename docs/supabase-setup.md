# Supabase Setup & Status Proyek

Dokumen ini adalah **sumber kebenaran** untuk konfigurasi Supabase proyek Mindfulnity.
Baca ini sebelum mengerjakan apa pun yang menyentuh auth, database, atau deployment.

## Kredensial

Tersimpan di `.env.local` (sudah di-gitignore, **jangan pernah commit**):

| Variabel | Nilai | Akses | Wajib? |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gveibbwqlyyzokcrgqqe.supabase.co` | client + server | ✅ Wajib |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` (lihat `.env.local`) | client (publik) | ✅ Wajib |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` (lihat `.env.local`) | **server-only** — narasi AI (LLM) + TTS | Opsional — tanpa ini fallback template lokal |
| `OPENROUTER_SCRIPT_MODEL` | `z-ai/glm-5.2:free` | **server-only** — override model LLM | Opsional |
| `OPENROUTER_TTS_VOICE` | — | **server-only** — suara TTS Fish | Opsional |
| `NEXT_PUBLIC_SITE_URL` | `https://<prod-domain>` | client+server — callback DOKU & OG | ✅ Wajib di prod |
| `FX_IDR_PER_USD` | `16500` | server — kurs ID/IDR ↔ EN/USD `lib/pricing.ts:3` | Opsional (default 16500) |
| `DOKU_CLIENT_ID` | — | **server-only** — DOKU Checkout `lib/payments/doku.ts:11` | Opsional — kosong = mock grant |
| `DOKU_SECRET_KEY` | `sk-doku-...` | **server-only** — HMAC webhook `lib/payments/doku.ts:150` | Opsional — kosong = mock |
| `DOKU_API_URL` | `https://api-sandbox.doku.com` → `https://api.doku.com` | **server-only** | Opsional |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` | **server-only** — `lib/supabase/admin.ts:5` untuk webhook DOKU (bypass RLS `entitlements`/`enrollments`) | ✅ Wajib di prod (webhook grant); opsional di dev (mock tanpa secret tetap grant via anon) |

Template: `.env.local.example`. Format key Supabase adalah format baru (`sb_publishable_` / `sb_secret_`),
bukan `anon`/`service_role` lama. Opsional: `OPENROUTER_SCRIPT_MODEL` (model LLM narasi),
`OPENROUTER_TTS_VOICE` (suara Fish).

> **Catatan `SUPABASE_SECRET_KEY`:** Dipakai `lib/supabase/admin.ts:5` untuk webhook DOKU `app/api/doku/webhook/route.ts:40` (upsert `entitlements`/`enrollments` bypass RLS). Tanpa ini, mock checkout via `lib/payments/doku.ts:124` tetap grant di dev, tapi **webhook prod tidak bisa grant** → pembayaran tetap `pending`. `scripts/validate-env.js:86` + `.env.local.example:32` menandai wajib di prod.

## Arsitektur

- Auth: Supabase (email/password + Google OAuth) via `@supabase/ssr` (v0.12.x) + `@supabase/supabase-js` (v2.x)
- Next.js 16: **`proxy.ts` menggantikan middleware** — gate `/app/*` → `/auth/login`, refresh token (pakai `getUser()` untuk verifikasi JWT)
- DAL: `lib/supabase/dal.ts` (`requireUser()` dipanggil di `app/app/layout.tsx`)
- Data: tabel `sessions` & `mood_entries` dengan RLS `user_id = auth.uid()` + `default auth.uid()`
- Hanya `mind-draft-v1` & `mind-settings` yang tersimpan di localStorage

## Status Checklist (per 2026-09-29) — UPDATE SETELAH SETIAP PERUBAHAN

| Item | Status |
| --- | --- |
| Proyek Supabase dibuat (`gveibbwqlyyzokcrgqqe`) | ✅ Aktif (GoTrue v2.195.0) |
| `.env.local` + `.env.local.example` | ✅ Dibuat — 2026-09-29 sync: `OPENROUTER_API_KEY` (AI/TTS), `DOKU_*` (mock), `FX_IDR_PER_USD` (16500), `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SECRET_KEY` (webhook prod) |
| Provider **Google** aktif | ✅ Aktif (verifikasi 2026-08-18 via `/auth/v1/settings`: `google: true`). Login OAuth sampai halaman Google tanpa error. Client ID & secret terpasang di dashboard |
| Google OAuth Client ID | `486047985669-5kuebifrp65l76sd8mtap6mlcatildhu.apps.googleusercontent.com` (secret di dashboard, jangan share) |
| **Migrasi SQL diterapkan** | ✅ `20260818_init.sql` (2026-08-18) + `20260826_relational_fix.sql` (2026-08-26) + **`20260929_billing_programs.sql` (2026-09-29: `programs` 3 seeded 19k/49k/99k, `program_days` 118 rows, `program_enrollments`/`program_progress`(`session_id→sessions.id` SET NULL), `payments`(`doku_invoice_id` unique), `entitlements`(`payment_id` FK), RLS `authenticated` katalog + user-scoped + service_role webhook) — via Supabase MCP |
| Test RLS (`supabase/tests/rls.test.sql`) | ✅ Lolos (2026-08-26, via MCP) — termasuk relasi `session_id`, unique check-in/manual, cascade hapus sesi |
| Konfirmasi email (mailer_autoconfirm) | ✅ **OFF** (`true` di `/auth/v1/settings`) — signup langsung login, tanpa email konfirmasi |
| Supabase MCP (opencode) | ✅ Config di `opencode.json` + `plugin ponytail` `@dietrichgebert/ponytail` — aktif setelah restart opencode + OAuth |
| Test user | ✅ `test@mindfulnity.local` terdaftar (2026-08-18, id `3f6ba0ef-6bed-4dcf-8637-0d685aeaed0a`). `ui-test@mindfulnity.local` dibuat saat verifikasi browser (opsional dihapus) |

## Untuk Cloner / Device Lain — Pakai Project yang Sama atau Buat Baru

### Opsi A — Pakai project yang sudah ada (paling cepat)
1. Minta `.env.local` dari maintainer **atau** isi dari `.env.local.example`:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://gveibbwqlyyzokcrgqqe.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_...` (dari Dashboard → Settings → API → Publishable key)
2. `npm run setup` → `npm run validate-env` → `npm run dev`
3. Tidak perlu migrasi — tabel & RLS sudah ada.

### Opsi B — Buat project Supabase baru
1. Buat project di `supabase.com/dashboard` → catat URL & anon key → isi `.env.local`.
2. Link & push migrasi:
   ```bash
   npx supabase link --project-ref <new-ref>
   npx supabase db push   # apply supabase/migrations/*.sql
   # atau via MCP: supabase_apply_migration untuk 20260818_init.sql + 20260826_relational_fix.sql
   ```
3. Aktifkan **Auth → Providers → Google** (Client ID + secret dari Google Cloud Console).
4. Jalankan `supabase/tests/rls.test.sql` untuk verifikasi RLS.
5. Update `opencode.json` `project_ref` ke ref baru jika pakai MCP.

## Checklist Production (Vercel) — Wajib sebelum deploy

| Setting | Lokasi | Nilai |
| --- | --- | --- |
| **Site URL** | Supabase Dashboard → Auth → URL Configuration | `https://<prod-domain>` (Vercel URL atau custom) |
| **Additional Redirect URLs** | Auth → URL Configuration | `https://<prod-domain>/auth/callback`, `https://<prod-domain>/**`, `https://*-<team>.vercel.app/auth/callback` (preview) |
| **Google OAuth — Authorized redirect URI** | Google Cloud Console → Credentials | `https://gveibbwqlyyzokcrgqqe.supabase.co/auth/v1/callback` (sudah terdaftar) |
| **Google OAuth — Authorized JS origins** | Google Cloud Console | Tambah `https://<prod-domain>` |
| **Env Vercel** | Vercel → Settings → Environment Variables | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY` (opsional), `NEXT_PUBLIC_SITE_URL` (wajib), `FX_IDR_PER_USD` (opsional 16500), `DOKU_CLIENT_ID`/`DOKU_SECRET_KEY`/`DOKU_API_URL` (opsional mock), `SUPABASE_SECRET_KEY` (wajib prod webhook) |

Lihat `docs/deployment.md` untuk langkah Vercel lengkap.

## Error yang Sudah Ditemui

- ~~`over_email_send_rate_limit` (429) pada signup~~ → **TERATASI** (2026-08-18): konfirmasi email dimatikan (`mailer_autoconfirm: true`), verifikasi via register `test@mindfulnity.local` & `ui-test@mindfulnity.local` tanpa 429
- ~~`Unsupported provider: provider is not enabled` pada Google login~~ → **TERATASI** (2026-08-18): provider Google diaktifkan di dashboard, login OAuth berhasil sampai halaman Google
- ~~`redirect_uri_mismatch` (antisipasi)~~ → **TIDAK TERJADI**: redirect URI `https://gveibbwqlyyzokcrgqqe.supabase.co/auth/v1/callback` sudah terdaftar di Google Cloud Console — untuk prod tambah `Authorized JS origins` domain prod (lihat checklist di atas)

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
