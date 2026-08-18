export type Locale = "id" | "en"

export const landingCopy = {
  id: {
    nav: {
      links: [
        { href: "#fitur", label: "Fitur" },
        { href: "#skenario", label: "Skenario" },
        { href: "#cara-kerja", label: "Cara Kerja" },
        { href: "#testimoni", label: "Testimoni" },
        { href: "#faq", label: "FAQ" },
      ],
      start: "Mulai",
    },
    hero: {
      badge: "Tersimpan di browser ini",
      headlineStart: "Tenang dimulai dari",
      headlineAccent: "satu napas.",
      subtext:
        "Meditasi terpandu, suara relaksasi, dan mood tracker — semuanya tersimpan di browser kamu.",
      primaryCta: "Mulai",
      secondaryCta: "Lihat cara kerja",
      circleLabel: "Ilustrasi lingkaran pernapasan",
    },
    features: {
      title: "Satu ruang untuk menenangkan diri",
      lead: "Tiga hal sederhana, tanpa tekanan.",
      items: [
        {
          title: "Meditasi Terpandu",
          description:
            "Sesi 7 fase dengan skrip yang bisa dibaca sebelum mulai.",
          points: [
            "7 fase yang mengalir dari tarik hingga hela napas.",
            "Skrip lengkap bisa dibaca dulu sebelum mulai.",
            "Durasi bebas, mulai dari 3 menit.",
          ],
        },
        {
          title: "Suara Relaksasi",
          description:
            "Hujan, laut, dan hutan — dibangkitkan langsung di browser.",
          points: [
            "Hujan, laut, dan hutan.",
            "Dibangkitkan langsung di browser, tanpa streaming.",
            "Campur beberapa suara jadi ambiens milikmu.",
          ],
        },
        {
          title: "Mood Tracker",
          description:
            "Catat suasana hati dan lihat pola 30 harimu pelan-pelan.",
          points: [
            "Check-in sekejap setelah sesi.",
            "Lihat pola 30 harimu dalam grafik kecil.",
            "Semua tersimpan lokal di perangkatmu.",
          ],
        },
      ],
    },
    useCases: {
      title: "Dibuat untuk momen-momenmu",
      lead: "Satu alat, banyak situasi.",
      items: [
        {
          title: "Pemula yang ingin mulai",
          description:
            "Belum pernah meditasi? Mulai dari sesi 3 menit dengan panduan langkah demi langkah.",
        },
        {
          title: "Jadwal yang padat",
          description:
            "Di sela rapat atau perjalanan, lima menit cukup untuk kembali tenang.",
        },
        {
          title: "Sulit tidur",
          description:
            "Suara relaksasi dan latihan napas untuk menenangkan pikiran sebelum tidur.",
        },
      ],
    },
    testimonials: {
      title: "Kata mereka",
      lead: "Cerita kecil dari pengguna Mindfulnity.",
      items: [
        {
          quote:
            "Lima menit sebelum tidur benar-benar mengubah rutinitasku. Rasanya lebih ringan.",
          name: "Anita",
          role: "Desainer, Jakarta",
        },
        {
          quote:
            "Aku tidak perlu akun atau aplikasi lain. Buka, tarik napas, selesai.",
          name: "Rizky",
          role: "Mahasiswa, Bandung",
        },
        {
          quote:
            "Grafik mood-nya bikin aku sadar polaku, pelan-pelan tapi nyata.",
          name: "Sarah",
          role: "Guru, Surabaya",
        },
      ],
    },
    faq: {
      title: "Pertanyaan yang sering diajukan",
      lead: "Jawaban singkat untuk hal yang paling sering ditanyakan.",
      items: [
        {
          question: "Apakah data saya aman?",
          answer:
            "Semua data tersimpan di browser perangkatmu sendiri. Tidak ada akun, tidak ada server, dan tidak ada pelacakan.",
        },
        {
          question: "Apakah butuh koneksi internet?",
          answer:
            "Tidak. Aplikasi berjalan sepenuhnya di perangkatmu, jadi kamu bisa bermeditasi di mana pun.",
        },
        {
          question: "Berapa lama satu sesi?",
          answer:
            "Mulai dari 3 menit. Kamu yang menentukan durasi sesuai jadwalmu.",
        },
        {
          question: "Apakah suara relaksasi di-streaming?",
          answer:
            "Tidak, suara dibangkitkan langsung di browser. Tanpa buffering, tanpa kuota terbuang.",
        },
        {
          question: "Apa bedanya dengan aplikasi meditasi lain?",
          answer:
            "Tidak ada langganan, tidak ada akun, dan semua tetap privat di perangkatmu.",
        },
      ],
    },
    howItWorks: {
      title: "Cara kerjanya",
      lead: "Tiga langkah, sesuai ritme kamu.",
      steps: [
        {
          title: "Siapkan sesi",
          description: "Pilih tujuan, guide, dan durasi dalam 5 langkah singkat.",
        },
        {
          title: "Dengarkan & ikuti",
          description:
            "Teks panduan berganti mengikuti napasmu, ditemani suara ambien.",
        },
        {
          title: "Catat perasaanmu",
          description:
            "Check-in singkat dan lihat progres tumbuh pelan-pelan.",
        },
      ],
    },
    cta: {
      title: "Tidak perlu sempurna, cukup mulai.",
      subtext: "Lima menit sehari untuk dirimu sendiri.",
      button: "Mulai",
    },
    footer: {
      tagline: "Mindfulnity — ruang kecil untuk menenangkan diri.",
      privacy: "Semua data tersimpan di browser ini. Tidak ada akun, tidak ada pelacakan.",
      rights: "Hak cipta.",
    },
  },
  en: {
    nav: {
      links: [
        { href: "#fitur", label: "Features" },
        { href: "#skenario", label: "Use cases" },
        { href: "#cara-kerja", label: "How it works" },
        { href: "#testimoni", label: "Testimonials" },
        { href: "#faq", label: "FAQ" },
      ],
      start: "Start",
    },
    hero: {
      badge: "Stored in this browser",
      headlineStart: "Calm starts with",
      headlineAccent: "a single breath.",
      subtext:
        "Guided meditation, relaxation sounds, and mood tracking — all stored in your browser.",
      primaryCta: "Start",
      secondaryCta: "See how it works",
      circleLabel: "A calm breathing illustration",
    },
    features: {
      title: "One space to unwind",
      lead: "Three simple things, no pressure.",
      items: [
        {
          title: "Guided Meditation",
          description:
            "7-phase sessions with scripts you can review before starting.",
          points: [
            "7 phases that flow from inhale to exhale.",
            "Full script you can review before starting.",
            "Flexible duration, from 3 minutes up.",
          ],
        },
        {
          title: "Relaxation Sounds",
          description:
            "Rain, ocean, and forest — generated right in your browser.",
          points: [
            "Rain, ocean, and forest.",
            "Generated in your browser — no streaming.",
            "Blend sounds into your own ambient mix.",
          ],
        },
        {
          title: "Mood Tracker",
          description: "Log how you feel and watch your 30-day pattern grow.",
          points: [
            "A quick check-in after each session.",
            "Watch your 30-day pattern in a small chart.",
            "Everything stays on your device.",
          ],
        },
      ],
    },
    useCases: {
      title: "Made for your moments",
      lead: "One tool, many situations.",
      items: [
        {
          title: "Just getting started",
          description:
            "Never meditated? Start with a 3-minute session and step-by-step guidance.",
        },
        {
          title: "A packed schedule",
          description:
            "Between meetings or on a commute, five minutes is enough to recenter.",
        },
        {
          title: "Trouble sleeping",
          description:
            "Relaxation sounds and breathing practice to quiet your mind before bed.",
        },
      ],
    },
    testimonials: {
      title: "What people say",
      lead: "Small stories from Mindfulnity users.",
      items: [
        {
          quote:
            "Five minutes before bed truly changed my routine. I feel lighter.",
          name: "Anita",
          role: "Designer, Jakarta",
        },
        {
          quote: "No account, no extra apps. Open it, breathe, done.",
          name: "Rizky",
          role: "Student, Bandung",
        },
        {
          quote:
            "The mood chart helped me notice my patterns — slowly but surely.",
          name: "Sarah",
          role: "Teacher, Surabaya",
        },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      lead: "Short answers to the things people ask most.",
      items: [
        {
          question: "Is my data safe?",
          answer:
            "All data lives in your own browser. No accounts, no servers, and no tracking.",
        },
        {
          question: "Do I need an internet connection?",
          answer:
            "No. The app runs entirely on your device, so you can meditate anywhere.",
        },
        {
          question: "How long is a session?",
          answer:
            "From 3 minutes up. You pick the duration that fits your day.",
        },
        {
          question: "Are the relaxation sounds streamed?",
          answer:
            "No — sounds are generated right in your browser. No buffering, no wasted data.",
        },
        {
          question: "How is this different from other meditation apps?",
          answer:
            "No subscriptions, no accounts, and everything stays private on your device.",
        },
      ],
    },
    howItWorks: {
      title: "How it works",
      lead: "Three steps, at your own pace.",
      steps: [
        {
          title: "Set up a session",
          description: "Pick a goal, guide, and duration in 5 short steps.",
        },
        {
          title: "Listen & follow",
          description:
            "Guided text shifts with your breath, backed by ambient sound.",
        },
        {
          title: "Log how you feel",
          description: "A short check-in and watch your progress grow slowly.",
        },
      ],
    },
    cta: {
      title: "No need to be perfect, just start.",
      subtext: "Five minutes a day for yourself.",
      button: "Start",
    },
    footer: {
      tagline: "Mindfulnity — a small space to calm down.",
      privacy: "All data stays in this browser. No accounts, no tracking.",
      rights: "All rights reserved.",
    },
  },
} as const

export type LandingCopy = (typeof landingCopy)[Locale]

export function getLandingCopy(locale: Locale): LandingCopy {
  return landingCopy[locale]
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "id" || value === "en"
}

export function getInitialLocale(
  stored: string | null | undefined,
  fallback: Locale = "id",
): Locale {
  return isLocale(stored) ? stored : fallback
}