# Alur User (User Flow)

Dokumen ini menjelaskan alur pengguna aplikasi mindfulness, diadaptasi dari referensi
[Wavr](https://wavr-webtest.vercel.app/) (AI hypnotherapy & audio wellness) namun
disederhanakan untuk MVP lokal tanpa backend.

## Prinsip Desain UX

Diadaptasi dari bahasa produk Wavr:

- **Anti-tekanan**: tidak ada streak pressure, "opsional", "cukup", "tidak perlu sempurna".
- **Privasi dulu**: semua data tersimpan di browser ("Tersimpan di browser ini").
- **Script dulu, audio menyusul**: teks panduan bisa direview sebelum memulai sesi audio.
- **Tenang & minimalis**: banyak whitespace, warna lembut, font heading (Outfit).

## Ringkasan Alur

```
LANDING (/)                     Landing → CTA "Mulai"
   ↓ (proxy.ts: belum login → /auth/login)
AUTH (/auth/login · /auth/signup)   Email/password atau Google
   ↓ berhasil → /app
DASHBOARD (/app)                Dashboard-first: sapaan, statistik, arsip, quick actions
   ├── "Sesi Baru" → WIZARD (/app/session/new)
   │      1. Personal start      nickname opsional, waktu sesi, durasi 5–60 mnt
   │      2. Tujuan              Tidur, Stres, Fokus, Percaya Diri, Relaksasi, Energi
   │      3. Guide               Mentor, Teman, Orang Tua, Future Self (nada teks)
   │      4. Bentuk Suara        suara alam + instrumen (Web Audio API)
   │      5. Anchor (opsional)   tempat aman, kata kunci, gratitude + ringkasan live
   │      COMPOSE                animasi 5 tahap → simpan ke Supabase
   │       ↓
   │      SESI (/app/session/[id])  teks 7 fase + timer cincin + suara ambien
   │       ↓ selesai
   │      CHECK-IN               mood sebelum/sesudah + refleksi + aksi integrasi
   │       ↓
   │      kembali ke Dashboard (statistik & mood diperbarui dari DB)
   ├── SUARA (/app/sounds)       katalog suara relaksasi standalone
   └── MOOD (/app/mood)          catat mood + grafik 30 hari
```

## Detail Per Layar

### 1. Landing Page (`/`)

| Elemen | Deskripsi |
| --- | --- |
| Navbar | Logo, tautan (Fitur, Cara Kerja), toggle bahasa ID/EN, CTA "Mulai" |
| Hero | Headline besar, subteks, visual lingkaran pernapasan beranimasi |
| Fitur | 3 kartu: Meditasi terpandu, Suara Relaksasi, Mood Tracker |
| Cara Kerja | 3 langkah singkat |
| CTA + Footer | Ajakan mulai + footer minimal |

### 2. Dashboard (`/app`)

| Elemen | Deskripsi |
| --- | --- |
| Sapaan | Berdasarkan waktu ("Selamat pagi") + tanggal |
| Statistik | Total menit, jumlah sesi, konsistensi (lembut, bukan streak keras) |
| Quick actions | "Sesi Baru", "Suara Relaksasi", "Catat Mood" |
| Arsip sesi | Sesi terakhir, bisa dibuka kembali (reopen script/audio) |
| Ringkasan mood | Mini-chart 7 hari |

### 3. Wizard Buat Sesi (`/app/session/new`) — 5 Langkah

Referensi: alur "Session Builder" Wavr. Draft tersimpan otomatis setiap langkah; jika
draft lama ditemukan, tampil banner "Lanjut dari langkah N" / "Mulai baru".

| Step | Konten |
| --- | --- |
| 1 Personal start | Nickname (opsional), waktu sesi (pagi/siang/malam/fleksibel), durasi slider 5–60 mnt |
| 2 Tujuan | 6 kartu pilihan: Tidur, Stres, Fokus, Percaya Diri, Relaksasi, Energi |
| 3 Guide | Persona: Mentor, Teman, Orang Tua, Future Self — memengaruhi nada bahasa teks |
| 4 Bentuk Suara | Pilih suara alam (hujan, laut, hutan, angin, malam) + instrumen + durasi |
| 5 Anchor | Tempat aman, orang/simbol terdekat, kata kunci, gratitude seed + ringkasan sesi live |

Tombol: `Back`, `Continue`, lalu `Compose sesi saya` (tahap terakhir menampilkan
animasi 5 tahap: "Membaca tujuanmu…", "Menyusun 7 fase…", dsb.)

### 4. Halaman Sesi (`/app/session/[id]`)

| Bagian | Deskripsi |
| --- | --- |
| 01 Sesi siap | Ringkasan: tujuan, guide, durasi, campuran suara |
| 02 Inti sesi | Deskripsi emosional dari pilihan pengguna |
| 03 Audio & Suara | Pemutar: timer countdown + animasi cincin + suara ambien |
| 04 Panduan baca | Teks 7 fase (template ID/EN sesuai tujuan), berganti sesuai progres, bisa disalin |

**Pengalaman meditasi**: timer countdown dengan cincin bernapas, suara ambien dimainkan,
teks fase ditampilkan secara bergantian sesuai porsi waktu.

### 5. Check-in (Setelah Sesi)

| Field | Deskripsi |
| --- | --- |
| Mood sebelum/sesudah | Pilihan emoji 1–5 (opsional) |
| Satu hal yang dirasakan | Textarea (opsional) |
| Aksi integrasi | Opsional, mis. "minum air", "tidur 10 menit lebih awal" |

Tombol: `Simpan & selesaikan`. Pesan penutup bernada lembut, mis. "Hari ini cukup."

Data check-in tersimpan dan menjadi input halaman Mood.

### 6. Halaman Suara (`/app/sounds`)

- Katalog suara alam + instrumen (dibangkitkan via Web Audio API, tanpa file).
- Play/stop per suara, volume per suara.
- CTA opsional "Pakai untuk sesi" (membuka wizard dengan suara terpilih).

### 7. Halaman Mood (`/app/mood`)

- Pilih mood emoji hari ini (5 level) + catatan singkat.
- Grafik 30 hari (recharts).
- Riwayat digabung dari check-in sesi dan entri manual.

## Data & Persistensi

Dokumen detail: [architecture.md](./architecture.md).

**Supabase (per akun, RLS):**

| Tabel | Isi |
| --- | --- |
| `sessions` | Sesi lengkap (tujuan, guide, campuran suara, skrip 7 fase, mood, refleksi, aksi integrasi) |
| `mood_entries` | Entri mood harian (sumber: `manual` / `checkin`) |

**localStorage (bukan data pengguna):**

| Key | Struktur | Deskripsi |
| --- | --- | --- |
| `mind-draft-v1` | Objek draft wizard | Resume pembuatan sesi |
| `mind-settings` | `{ language, volume }` | Preferensi pengguna |

## Perbedaan dari Wavr

| Aspek | Wavr | Aplikasi ini (MVP) |
| --- | --- | --- |
| Halaman | SPA 1 halaman | Landing + halaman aplikasi terpisah |
| Masuk pertama | Wizard langsung | Login dulu → dashboard-first, wizard saat "Sesi Baru" |
| Pembuatan sesi | AI + API | Compose dari template lokal (ID/EN), simpan ke Supabase |
| Auth | Supabase (email/password) | Supabase: email/password + Google |
| Pembayaran | Stripe/Apple/Google | Tidak ada di MVP |
| Suara panduan (voice) | ElevenLabs/OpenAI | Tidak ada; audio = suara ambien |
| Program | 7/21/90 hari | Roadmap (tidak di MVP) |
| Check-in | Sebelum/sesudah + refleksi | Dipertahankan |
