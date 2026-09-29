# Panduan Developer — Mindfulnity

Untuk setup clone baru, struktur, dan troubleshooting. Lihat juga `README.md` (quick start), `docs/architecture.md` (arsitektur), `docs/supabase-setup.md` (Supabase), `docs/deployment.md` (deploy).

## Prasyarat

- Node `>=20.9.0`, npm `>=10` — cek `node -v`, `npm -v`. Repo pakai `.nvmrc` (`20.9.0`) — `nvm use` / `fnm use` otomatis.
- Git, browser modern (Web Audio API untuk suara relaksasi).

## Setup (Device Baru)

### 1. Clone & setup otomatis

```bash
git clone <repo-url> mindfulnity
cd mindfulnity
npm run setup
```

`scripts/setup.js` akan:
- Cek Node/npm version
- Copy `.env.local.example` → `.env.local` jika belum ada
- `npm ci` jika `node_modules` belum ada

### 2. Isi `.env.local`

| Variabel | Wajib | Cara dapat |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Dashboard → API → Publishable key (`sb_publishable_...`) |
| `OPENROUTER_API_KEY` | Opsional | `https://openrouter.ai/settings/keys` → `sk-or-v1-...` |

Tanpa `OPENROUTER_API_KEY` app tetap jalan — wizard pakai template lokal `lib/templates.ts`, TTS skip. `SUPABASE_SECRET_KEY` tidak dipakai (lihat `docs/supabase-setup.md`).

### 3. Validasi & jalan

```bash
npm run validate-env   # cek format URL/key
npm run dev            # http://localhost:3000
```

Buka `/` (landing), `/auth/login` (login), `/app` (redirect ke login jika belum auth — gate `proxy.ts`).

## Supabase — Opsi untuk Cloner

### Opsi A — Pakai project yang sudah ada (cepat)

Gunakan project `gveibbwqlyyzokcrgqqe` (sudah migrasi + RLS). Minta `.env.local` dari maintainer atau isi manual:

```
NEXT_PUBLIC_SUPABASE_URL=https://gveibbwqlyyzokcrgqqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_... (dari Dashboard)
```

Tidak perlu migrasi. `npm run dev` langsung bisa daftar/login (Google OAuth sudah aktif — `docs/supabase-setup.md`).

### Opsi B — Buat project baru

1. Buat project di `supabase.com/dashboard` → catat URL & anon key → isi `.env.local`.
2. Apply migrasi:
   ```bash
   npx supabase link --project-ref <new-ref>
   npx supabase db push
   # atau via MCP: apply supabase/migrations/20260818_init.sql + 20260826_relational_fix.sql
   ```
3. Aktifkan **Auth → Providers → Google** (butuh Client ID/secret dari Google Cloud Console).
4. Verifikasi RLS: jalankan `supabase/tests/rls.test.sql`.
5. (Jika pakai MCP) update `opencode.json` `project_ref` ke ref baru.

## Struktur Penting

```
app/layout.tsx, app/page.tsx, app/globals.css
app/auth/login|signup/page.tsx, app/auth/callback/route.ts
app/app/layout.tsx, app/app/page.tsx, app/app/session/new, app/app/session/[id]
app/api/tts/route.ts
proxy.ts                 # Gate /app + refresh token — Next 16 pakai proxy.ts, bukan middleware.ts
lib/supabase/client.ts   # Browser (NEXT_PUBLIC_*)
lib/supabase/server.ts   # Server (cookies via next/headers)
lib/supabase/dal.ts      # requireUser() — guard /app
lib/i18n/                # locale.ts, landing.ts, app.ts
lib/templates.ts         # 7 fase fallback
lib/ai-script.ts         # LLM OpenRouter + sanitasi → fallback template
lib/tts.ts, lib/voice-player.ts, lib/sound-engine.ts
scripts/setup.js, scripts/validate-env.js
```

- Alias `@/*` → root (`tsconfig.json:21`).
- Layout typed `LayoutProps<'/path'>` (Next 16).
- Komponen interaktif pakai `"use client"` (lihat `docs/architecture.md`).

## Scripts & Testing

```bash
npm test              # Vitest run
npm run test:watch    # watch mode
npm run test:coverage # coverage v8
npm run lint          # ESLint (next/core-web-vitals)
npm run build         # prebuild validate-env + next build
```

Test di `tests/` mirror `lib/` & `components/`. Mock `@supabase/ssr` untuk repo/server actions; logic murni tanpa mock. Setup di `tests/setup.ts`. Lihat `docs/testing.md`.

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| `over_email_send_rate_limit` (429) | Sudah teratasi — `mailer_autoconfirm: true` di `docs/supabase-setup.md`. Jika muncul lagi, cek Auth → Email → Confirm email OFF |
| `Unsupported provider: not enabled` | Aktifkan Google provider di Supabase Dashboard → Auth → Providers |
| `redirect_uri_mismatch` Google | Pastikan `https://<project>.supabase.co/auth/v1/callback` di Google Cloud → Authorized redirect URIs; untuk prod tambah domain di Authorized JS origins (lihat `docs/deployment.md`) |
| `NEXT_PUBLIC_*` undefined saat build | Isi `.env.local` atau set di Vercel env; `scripts/validate-env.js` akan warning di `prebuild` |
| Port 3000 dipakai | `PORT=3001 npm run dev` |
| Suara tidak bunyi | Browser block autoplay — interaksi user dulu; cek `mind-settings.volume` di localStorage |
| Node version error | `nvm use` atau update Node ke `>=20.9.0` |

## Bahasa (i18n)

- Dictionary `lib/i18n/` (ID default + EN), `LanguageProvider` di `components/providers/language-context.tsx` via `useSyncExternalStore` + `localStorage` `mind-settings.language`.
- Template 7 fase ada varian ID+EN (`lib/templates.ts`).

## Catatan Next.js 16

- Middleware = `proxy.ts` di root — jangan buat `middleware.ts` (lihat `AGENTS.md`).
- `next.config.ts` sudah ada `headers()` (CSP, HSTS, X-Frame) + `poweredByHeader: false`.
- `app/auth/callback/route.ts` validasi `next` (`startsWith("/")` anti open-redirect), `proxy.ts` pakai `getUser()` untuk verifikasi JWT.
