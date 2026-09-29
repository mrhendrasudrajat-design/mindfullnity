#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const ROOT = path.resolve(__dirname, "..")
const EXAMPLE = path.join(ROOT, ".env.local.example")
const TARGET = path.join(ROOT, ".env.local")

function checkNode() {
  const major = Number(process.versions.node.split(".")[0])
  const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim()
  const npmMajor = Number(npmVersion.split(".")[0])
  let ok = true
  if (major < 20) {
    console.error(`[setup] Node ${process.versions.node} terdeteksi — butuh >=20.9.0. Gunakan nvm/fnm atau update Node.`)
    ok = false
  }
  // minor check for 20.9
  if (major === 20) {
    const minor = Number(process.versions.node.split(".")[1])
    if (minor < 9) console.warn(`[setup] Node ${process.versions.node} — disarankan >=20.9.0`)
  }
  if (npmMajor < 10) {
    console.warn(`[setup] npm ${npmVersion} terdeteksi — disarankan >=10.0.0`)
  }
  return ok
}

function ensureEnv() {
  if (fs.existsSync(TARGET)) {
    console.log("[setup] .env.local sudah ada — dilewati.")
    return
  }
  if (!fs.existsSync(EXAMPLE)) {
    console.warn("[setup] .env.local.example tidak ditemukan — buat manual .env.local")
    return
  }
  fs.copyFileSync(EXAMPLE, TARGET)
  console.log("[setup] .env.local dibuat dari .env.local.example — silakan isi nilai asli.")
  console.log("        Lihat docs/supabase-setup.md untuk cara ambil URL & anon key.")
}

function install() {
  const hasNodeModules = fs.existsSync(path.join(ROOT, "node_modules"))
  if (hasNodeModules) {
    console.log("[setup] node_modules sudah ada — jalankan `npm ci` jika ingin fresh install.")
    return
  }
  console.log("[setup] Menjalankan npm ci ...")
  execSync("npm ci", { stdio: "inherit", cwd: ROOT })
}

function main() {
  console.log("[setup] Mindfulnity — setup clone-ready")
  const nodeOk = checkNode()
  ensureEnv()
  install()
  console.log("")
  console.log("[setup] Selesai.")
  console.log("  1. Isi .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)")
  console.log("     Opsional: OPENROUTER_API_KEY untuk narasi AI + TTS (tanpa ini app tetap jalan via template)")
  console.log("  2. npm run validate-env  — cek env")
  console.log("  3. npm run dev           — http://localhost:3000")
  console.log("  4. npm test / npm run lint / npm run build — verifikasi sebelum push")
  console.log("")
  console.log("  Docs: README.md, docs/development.md, docs/deployment.md, docs/supabase-setup.md")
  if (!nodeOk) process.exitCode = 1
}

main()
