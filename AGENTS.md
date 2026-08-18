<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Konteks Proyek Mindfulnity

- **Baca `docs/architecture.md`** (struktur & pola) dan **`docs/supabase-setup.md`** (kredensial, status checklist, error yang ditemui) sebelum mengerjakan tugas apa pun — perbarui `docs/supabase-setup.md` setelah mengubah status backend.
- Supabase terhubung via MCP (`opencode.json`): migrasi & test RLS dijalankan lewat MCP; status provider/migrasi ada di checklist `docs/supabase-setup.md`.
- Next.js 16: middleware = `proxy.ts` di root. Jangan buat `middleware.ts`/`middleware.js`.
- Bahasa default UI: Indonesia (dictionary di `lib/i18n/`, ID/EN identik bentuknya).
- Verifikasi wajib setelah perubahan kode: `npm test`, `npm run lint`, `npm run build`.
