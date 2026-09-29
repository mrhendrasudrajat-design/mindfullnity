# Mindfulnity — SaaS Meditasi & Mood

Aplikasi meditasi terpandu + mood tracker. Next.js 16 + Supabase (Auth + RLS) + OpenRouter (LLM/TTS gratis) + Tailwind v4.

**Brand:** Mindfulnity — tenang, minimal, anti-tekanan. Landing di `/`, app protected di `/app`.

## Quick Start (Clone → Jalan)

```bash
git clone <repo-url> mindfulnity
cd mindfulnity
npm run setup          # cek Node, copy .env.local.example → .env.local, npm ci
# isi .env.local — lihat tabel Env di bawah
npm run validate-env   # cek env
npm run dev            # http://localhost:3000
```

**Prasyarat:** Node `>=20.9.0`, npm `>=10` (cek `node -v`, `npm -v`; atau `nvm use` baca `.nvmrc`).

## Env

| Variabel | Wajib | Cara dapat | Keterangan |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard → Settings → API → Project URL | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Dashboard → API → Publishable key | `sb_publishable_...` (format baru) |
| `OPENROUTER_API_KEY` | Opsional | `openrouter.ai/settings/keys` | `sk-or-v1-...` — tanpa ini wizard fallback ke `lib/templates.ts`, TTS skip (tetap jalan) |
| `OPENROUTER_SCRIPT_MODEL` | Opsional | — | default `z-ai/glm-5.2:free` |
| `OPENROUTER_TTS_VOICE` | Opsional | — | default suara Fish auto |

Template: `.env.local.example` (di-copy oleh `npm run setup`). Jangan commit `.env.local` (sudah `.gitignore`).

> `SUPABASE_SECRET_KEY` **tidak dipakai** — `lib/supabase/server.ts` & `proxy.ts` pakai `anon key` + RLS. Hanya set jika Anda buat `lib/supabase/admin.ts` service_role.

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run setup` | Setup clone: cek Node, copy env, `npm ci` |
| `npm run validate-env` | Validasi env (format URL/key) |
| `npm run dev` | Dev server (`next dev`) |
| `npm run build` | Production build (jalan `validate-env` dulu) |
| `npm start` | Start prod (setelah build) |
| `npm run lint` | ESLint |
| `npm test` | Vitest run (167 tests) |
| `npm run test:watch` | Vitest watch |
| `npm run test:coverage` | Coverage v8 |

## Struktur

```
app/            # Next.js App Router (layout, page, auth/callback, app/*, api/tts)
proxy.ts        # Gate /app + refresh token (Next 16 — bukan middleware.ts)
supabase/migrations/ # SQL RLS (sessions, mood_entries)
components/     # ui, landing, auth, app (shell/dashboard/wizard/session/sounds/mood)
lib/            # i18n, templates, stats, player, sound-engine, supabase/*, tts, ai-script
tests/          # Vitest (lib + components)
scripts/        # setup.js, validate-env.js
```

Alias `@/*` → root. Layout typed `LayoutProps<'/path'>`. Lihat `docs/architecture.md` untuk detail.

## Supabase

- **Project aktif:** `gveibbwqlyyzokcrgqqe` (lihat `docs/supabase-setup.md`).
- **Opsi cloner:** (A) pakai project yang sama (share anon key), atau (B) buat project baru + `supabase db push` migrasi — lihat `docs/supabase-setup.md` & `docs/development.md`.
- **MCP:** `opencode.json` → `https://mcp.supabase.com/mcp?project_ref=...` (database, auth, migrations).

## Deploy (Vercel)

Ringkasan: push GitHub → Import di `vercel.com/new` → set env Production/Preview (`NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY`, `OPENROUTER_API_KEY`) → deploy → set Supabase Site URL + Google OAuth `Authorized JS origins` ke domain prod.

Lengkap: `docs/deployment.md` (+ checklist `docs/supabase-setup.md`).

## Dokumentasi

- `docs/architecture.md` — tech stack, routing, auth/RLS, audio, TTS, pola
- `docs/supabase-setup.md` — kredensial, checklist migrasi, provider, error, prod checklist
- `docs/development.md` — panduan developer (setup, struktur, testing, troubleshooting)
- `docs/deployment.md` — panduan deploy Vercel step-by-step
- `docs/testing.md` — Vitest setup & coverage
- `CONTRIBUTING.md` — workflow kontribusi
- `AGENTS.md` — aturan Next 16 (`proxy.ts`) & verifikasi wajib

## Verifikasi Wajib (sebelum push)

```bash
npm test
npm run lint
npm run build
```
