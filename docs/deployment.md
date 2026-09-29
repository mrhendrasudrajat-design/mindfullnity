# Deployment — Mindfulnity ke Vercel

## Ringkasan

- **Platform:** Vercel (Next.js 16 auto-detect, zero-config). Tidak butuh `vercel.json` / `Dockerfile` untuk prod.
- **Build:** `npm run build` (jalan `scripts/validate-env.js` via `prebuild` lalu `next build`).
- **Runtime:** Node `>=20.9.0` (via `package.json:engines` + `.nvmrc`).
- **Env:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` wajib; `OPENROUTER_API_KEY` opsional (tanpa ini fallback template — tetap jalan).
- **Supabase:** Project `gveibbwqlyyzokcrgqqe` sudah migrasi (`supabase/migrations/*.sql` + RLS). Untuk prod domain, update Site URL & Redirect URLs.

## Prasyarat

- Repo sudah push ke GitHub (`.env.local` tidak ter-commit — `.gitignore` sudah).
- Akun Vercel + akses Supabase Dashboard project `gveibbwqlyyzokcrgqqe` + Google Cloud Console (untuk OAuth origins).
- Lokal sudah `npm test`, `npm run lint`, `npm run build` lolos.

## Langkah Deploy Vercel (Pertama Kali)

### 1. Import project

1. Buka `https://vercel.com/new` → Import Git repository `aplikasi-saas`.
2. Framework: **Next.js** (auto). Build Command: `npm run build`, Output: `.next`, Install: `npm ci` (default).
3. Jangan deploy dulu — set env dulu (langkah 2).

### 2. Set Environment Variables (Vercel Dashboard → Settings → Environment Variables)

Tambahkan untuk **Production** + **Preview** (Development opsional jika pakai `vercel dev`):

| Key | Value | Env |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gveibbwqlyyzokcrgqqe.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` (dari `.env.local` / Dashboard → API) | Production, Preview |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Production (Preview opsional) — kosong = fallback template |
| `OPENROUTER_SCRIPT_MODEL` | (opsional) `z-ai/glm-5.2:free` | Production |
| `OPENROUTER_TTS_VOICE` | (opsional) | Production |
| `DOKU_CLIENT_ID` | DOKU Dashboard → Client ID | Production — kosong = mock checkout |
| `DOKU_SECRET_KEY` | DOKU Secret Key (**server-only**) | Production |
| `DOKU_API_URL` | `https://api-sandbox.doku.com` → prod `https://api.doku.com` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://<prod>` | Production, Preview — untuk `callback_url` DOKU |
| `FX_IDR_PER_USD` | `16500` | Production — kurs ID/IDR ↔ EN/USD |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` (**server-only**, untuk DOKU webhook grant) | Production |

> `SUPABASE_SECRET_KEY` **sekarang dipakai** oleh `lib/supabase/admin.ts:1` untuk webhook DOKU (bypass RLS `entitlements`/`enrollments`). Tanpa ini, mock checkout tetap grant jika dijalankan via anon (dev), tapi webhook prod butuh secret.

### 3. Deploy

Klik **Deploy**. Tunggu build (lihat logs — `prebuild` validate-env warning wajar jika env belum inject saat build preview, tapi Production harus lolos). Dapat URL `https://<project>.vercel.app`.

### 4. Konfigurasi Supabase Dashboard (wajib — sebelum test OAuth)

Di `https://supabase.com/dashboard/project/gveibbwqlyyzokcrgqqe`:

1. **Auth → URL Configuration → Site URL:** `https://<project>.vercel.app` (atau custom domain jika sudah).
2. **Auth → URL Configuration → Additional Redirect URLs** (comma-separated):
   ```
   https://<project>.vercel.app/auth/callback
   https://<project>.vercel.app/**
   https://*-<team>.vercel.app/auth/callback   # untuk preview deploys (opsional)
   ```
   Jika pakai custom domain, tambah `https://<custom>/auth/callback` juga.
3. Simpan.

### 5. Google Cloud Console (jika pakai Google OAuth)

1. Buka `console.cloud.google.com` → APIs & Services → Credentials → OAuth 2.0 Client ID `486047985669-...`.
2. **Authorized redirect URIs** sudah ada `https://gveibbwqlyyzokcrgqqe.supabase.co/auth/v1/callback` — biarkan.
3. **Authorized JavaScript origins** → tambah `https://<project>.vercel.app` (dan custom domain jika ada). Simpan.

### 6. Verifikasi pasca-deploy

- `https://<project>.vercel.app/` → landing (200).
- `https://<project>.vercel.app/app` tanpa login → 302 ke `/auth/login` (gate `proxy.ts:11`).
- Daftar/login email → redirect `/app`.
- Login Google → sampai Google → callback → `/app`.
- Buat sesi via wizard `/app/session/new` → tanpa `OPENROUTER_API_KEY` harus fallback sukses (template lokal).
- `POST /api/tts` tanpa login → 401/redirect; cek `Cache-Control: private, max-age=3600`.
- Program `/app/program` → katalog 7/21/90 (ID: Rp19k/49k/99k, EN: $1.15/$2.97/$6.00 FX 16500) → checkout tanpa `DOKU_*` langsung grant (mock) → `entitlements` + `program_enrollments` terisi → day 1 unlock, day 2 terkunci sampai day 1 selesai (`program_progress.session_id → sessions.id`).
- Webhook `POST /api/doku/webhook` — bypass `proxy.ts:11` (verify `X-DOKU-Signature` HMAC-SHA256, idempotent `doku_invoice_id`).

## Deploy Selanjutnya (CI)

- Push ke `main` → Vercel auto deploy Production.
- Push ke branch/PR → Preview deployment (env Preview dipakai).
- Rollback: Vercel → Deployments → pilih deployment → Promote to Production.

## Custom Domain (opsional)

1. Vercel → Settings → Domains → Add `mindfulnity.com` (atur DNS CNAME/A).
2. Update Supabase **Site URL** ke `https://mindfulnity.com` + tambah Redirect `https://mindfulnity.com/auth/callback`.
3. Update Google Cloud **Authorized JS origins** ke `https://mindfulnity.com`.

## Troubleshooting Deploy

| Gejala | Penyebab | Fix |
| --- | --- | --- |
| Build fail `NEXT_PUBLIC_* is required` | Env belum set di Vercel | Set di Settings → Env → redeploy |
| OAuth `redirect_uri_mismatch` | Google Authorized redirect belum | Cek Supabase `auth/v1/callback` di Google Cloud |
| Google login redirect ke localhost | Supabase Site URL masih `localhost` | Ganti ke `https://<prod>` |
| Preview OAuth gagal | `Additional Redirect URLs` belum include `*-vercel.app` | Tambah wildcard preview URL |
| TTS 502 `tts not configured` | `OPENROUTER_API_KEY` kosong | Set di Vercel Production env (opsional — app tetap jalan tanpa TTS) |
| Header CSP block | CSP terlalu strict | Edit `next.config.ts:8` — allow `*.supabase.co`, `openrouter.ai`, `*.doku.com` sudah ada |
| Checkout DOKU gagal (401 signature) | `DOKU_SECRET_KEY` salah / `Request-Id` mismatch | Cek Dashboard DOKU + `NEXT_PUBLIC_SITE_URL` |
| Program tetap terkunci setelah bayar | Webhook belum grant (`SUPABASE_SECRET_KEY` kosong) | Set `SUPABASE_SECRET_KEY` di Vercel Production |

## Alternatif: Docker / Self-Host

Butuh `output: 'standalone'` di `next.config.ts` + `Dockerfile` multi-stage (belum ada). Untuk sekarang, disarankan Vercel saja. Lihat `docs/architecture.md` untuk struktur.
