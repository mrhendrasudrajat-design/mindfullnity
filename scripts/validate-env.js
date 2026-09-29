#!/usr/bin/env node
const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")

// Load .env.local if present (simple parser, no deps)
function loadDotEnv(file) {
  if (!fs.existsSync(file)) return
  const content = fs.readFileSync(file, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!(key in process.env)) process.env[key] = val
  }
}
loadDotEnv(path.join(ROOT, ".env.local"))
loadDotEnv(path.join(ROOT, ".env"))

const required = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    validate: (v) => {
      try {
        const u = new URL(v)
        return u.protocol === "https:" && u.hostname.includes("supabase.co")
      } catch {
        return false
      }
    },
    hint: "https://<project>.supabase.co — Supabase Dashboard → Settings → API",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    validate: (v) => v.startsWith("sb_publishable_") || v.startsWith("eyJ"),
    hint: "sb_publishable_... (format baru) atau JWT anon — Dashboard → API → Publishable key",
  },
]

const optional = [
  {
    key: "OPENROUTER_API_KEY",
    validate: (v) => v.startsWith("sk-or-v1-"),
    hint: "sk-or-v1-... dari https://openrouter.ai/settings/keys — kosong = fallback template lokal (tetap jalan)",
  },
  { key: "OPENROUTER_SCRIPT_MODEL", validate: () => true, hint: "default: z-ai/glm-5.2:free" },
  { key: "OPENROUTER_TTS_VOICE", validate: () => true, hint: "default: suara Fish auto" },
  { key: "DOKU_CLIENT_ID", validate: (v) => v.length > 5, hint: "DOKU Dashboard → Client ID — kosong = mock checkout (tanpa DOKU)" },
  { key: "DOKU_SECRET_KEY", validate: (v) => v.length > 5, hint: "DOKU Dashboard → Secret Key — server-only" },
  { key: "DOKU_API_URL", validate: (v) => v.startsWith("https://"), hint: "https://api-sandbox.doku.com atau https://api.doku.com" },
  { key: "FX_IDR_PER_USD", validate: (v) => !isNaN(Number(v)) && Number(v) > 0, hint: "default 16500 — kurs untuk display USD (EN)" },
  { key: "NEXT_PUBLIC_SITE_URL", validate: (v) => v.startsWith("https://"), hint: "https://<prod> untuk DOKU callback_url" },
]

let hasError = false

for (const { key, validate, hint } of required) {
  const val = process.env[key]
  if (!val) {
    console.error(`[validate-env] ✗ ${key} kosong — ${hint}`)
    hasError = true
  } else if (!validate(val)) {
    console.error(`[validate-env] ✗ ${key} format tidak valid — ${hint} (nilai: ${val.slice(0, 20)}...)`)
    hasError = true
  } else {
    console.log(`[validate-env] ✓ ${key} ok`)
  }
}

for (const { key, validate, hint } of optional) {
  const val = process.env[key]
  if (!val) {
    console.log(`[validate-env] ○ ${key} kosong — ${hint}`)
  } else if (!validate(val)) {
    console.warn(`[validate-env] ! ${key} format mencurigakan — ${hint}`)
  } else {
    console.log(`[validate-env] ✓ ${key} ok`)
  }
}

if (process.env.SUPABASE_SECRET_KEY) {
  console.log("[validate-env] ✓ SUPABASE_SECRET_KEY terisi — dipakai untuk DOKU webhook (service_role)")
} else {
  console.log("[validate-env] ○ SUPABASE_SECRET_KEY kosong — DOKU webhook mock akan skip admin grant (isi untuk prod)")
}
if (process.env.DOKU_CLIENT_ID && !process.env.DOKU_SECRET_KEY) {
  console.log("[validate-env] ! DOKU_CLIENT_ID terisi tapi DOKU_SECRET_KEY kosong — checkout akan gagal")
}
if (!process.env.DOKU_CLIENT_ID) {
  console.log("[validate-env] ○ DOKU mode mock aktif — checkout langsung grant tanpa redirect (isi DOKU_* untuk real DOKU)")
}

if (hasError) {
  console.error("\n[validate-env] Env belum lengkap — isi .env.local (lihat .env.local.example & docs/supabase-setup.md)")
  console.error("  Untuk build Vercel: set env yang sama di Vercel Dashboard → Settings → Environment Variables")
  // Don't fail build on CI if env is injected at runtime; only warn in prebuild
  // But exit 1 so `npm run validate-env` jelas gagal; prebuild will still block
  const isPrebuild = process.argv.includes("--prebuild") || process.env.npm_lifecycle_event === "prebuild"
  if (isPrebuild) {
    console.warn("[validate-env] prebuild: lanjut build (Vercel inject env saat runtime) — warning saja")
  } else {
    process.exitCode = 1
  }
} else {
  console.log("[validate-env] Semua env wajib terisi.")
}
