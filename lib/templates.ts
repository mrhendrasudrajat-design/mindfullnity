import { getAppCopy, type AppCopy } from "@/lib/i18n/app"
import type { Locale } from "@/lib/i18n/locale"

export const GOAL_IDS = [
  "sleep",
  "stress",
  "focus",
  "confidence",
  "relax",
  "energy",
] as const
export type GoalId = (typeof GOAL_IDS)[number]

export const GUIDE_IDS = ["mentor", "friend", "parent", "futureSelf"] as const
export type GuideId = (typeof GUIDE_IDS)[number]

export const PHASE_IDS = [
  "arrive",
  "breatheIn",
  "breatheOut",
  "settle",
  "release",
  "anchor",
  "return",
] as const
export type PhaseId = (typeof PHASE_IDS)[number]

export type Phase = {
  id: PhaseId
  title: string
  lines: string[]
}

export type SoundMix = {
  nature: string[]
  instruments: string[]
}

export type Session = {
  id: string
  createdAt: string
  title: string
  goal: GoalId
  guide: GuideId
  soundMix: SoundMix
  durationMin: number
  phases: Phase[]
  moodBefore?: number
  moodAfter?: number
  reflection?: string
  integrationAction?: string
}

type PhaseLines = Record<PhaseId, string[]>

export type SessionInput = {
  goal: GoalId
  guide: GuideId
  soundMix: SoundMix
  durationMin: number
  locale: Locale
  nickname?: string
  keyword?: string
  safePlace?: string
  gratitude?: string
}

type AnchorValues = {
  nickname: string
  keyword: string
  safePlace: string
  gratitude: string
}

const DEFAULT_ANCHORS: Record<Locale, AnchorValues> = {
  id: {
    nickname: "kamu",
    keyword: "tenang",
    safePlace: "tempat amanmu",
    gratitude: "satu hal sederhana yang kamu syukuri",
  },
  en: {
    nickname: "you",
    keyword: "calm",
    safePlace: "your safe place",
    gratitude: "one simple thing you are grateful for",
  },
}

function interpolate(line: string, values: AnchorValues): string {
  return line
    .replaceAll("{nickname}", values.nickname)
    .replaceAll("{keyword}", values.keyword)
    .replaceAll("{safePlace}", values.safePlace)
    .replaceAll("{gratitude}", values.gratitude)
}

function goalLabel(copy: AppCopy, goal: GoalId): string {
  return copy.wizard.steps.goal.goals[goal].title
}

function guideIntro(locale: Locale, guide: GuideId, nickname: string): string {
  const intros: Record<Locale, Record<GuideId, string>> = {
    id: {
      mentor: `Halo, ${nickname}. Ikuti napasmu, dan biarkan aku memandu dari sini.`,
      friend: `Hey, ${nickname}. Santai saja, kita jalan bareng sebentar.`,
      parent: `Tenanglah, nak. Kamu aman di sini. Ikuti aku pelan-pelan.`,
      futureSelf: `Halo, diriku. Aku tahu hari-harimu berat. Mari kita hadir bersama sekarang.`,
    },
    en: {
      mentor: `Hello, ${nickname}. Follow your breath and let me guide you from here.`,
      friend: `Hey, ${nickname}. Relax — we're in this together for a moment.`,
      parent: `Take it easy, dear. You're safe here. Follow me slowly.`,
      futureSelf: `Hello, me. I know your days have been heavy. Let's be here together now.`,
    },
  }
  return intros[locale][guide]
}

const SCRIPTS_ID: Record<GoalId, PhaseLines> = {
  sleep: {
    arrive: [
      "Duduk atau berbaring senyaman mungkin.",
      "Tutup mata pelan-pelan.",
      "Biarkan kamar mulai meredup dalam kesadaranmu.",
    ],
    breatheIn: [
      "Tarik napas dalam-dalam lewat hidung.",
      "Rasakan udara masuk dan paru-paru mengembang.",
      "Biarkan bahumu naik pelan-pelan.",
    ],
    breatheOut: [
      "Hembuskan perlahan lewat mulut.",
      "Rasakan ketegangan ikut keluar bersamanya.",
      "Setiap hembusan membawamu sedikit lebih dekat ke tidur.",
    ],
    settle: [
      "Biarkan napas mengalir dengan ritmenya sendiri.",
      "Kamu tidak perlu melakukan apa pun sekarang.",
      "Tubuhmu tahu cara rileks.",
    ],
    release: [
      "Lepaskan daftar pikiran hari ini satu per satu.",
      "Tidak ada yang perlu dipecahkan malam ini.",
      "Esok hari akan tetap ada, tapi sekarang bukan waktunya.",
    ],
    anchor: [
      "Bawa perhatian ke titik di antara dua napas.",
      `Ulangi dalam hati: “{keyword}”.`,
      "Bayangkan dirimu melayang menuju {safePlace}.",
    ],
    return: [
      "Tidak perlu terburu-buru.",
      "Jika kamu mulai mengantuk, biarkan saja. Sesimu sudah selesai.",
      "Kembali dengan lembut ke tubuhmu, lalu pilih untuk beristirahat.",
    ],
  },
  stress: {
    arrive: [
      "Duduk dengan nyaman, kedua kaki menapak lantai.",
      "Tutup mata, dan akui: hari ini terasa berat.",
      "Kamu tidak harus merasa baik-baik saja sekarang.",
    ],
    breatheIn: [
      "Tarik napas pelan lewat hidung.",
      "Rasakan udara mengisi dada hingga perut.",
      "Berikan ruang untuk hari yang berat ini.",
    ],
    breatheOut: [
      "Hembuskan lebih panjang dari tarikanmu.",
      "Bayangkan ketegangan meninggalkan bahu dan rahang.",
      "Tidak perlu buru-buru; hela lagi.",
    ],
    settle: [
      "Biarkan napas kembali normal dengan sendirinya.",
      "Perhatikan sensasi di tubuh, tanpa menilainya.",
      "Kamu cukup — apa adanya, tanpa pencapaian apa pun.",
    ],
    release: [
      "Bayangkan ketegangan seperti selimut yang kamu buka pelan-pelan.",
      "Lepaskan kekhawatiran tentang hal yang belum terjadi.",
      "Untuk beberapa menit ini, kamu bebas dari semuanya.",
    ],
    anchor: [
      "Letakkan satu tangan di dada, satu di perut.",
      "Rasakan hangatnya telapak tanganmu sendiri.",
      `Bisikkan dalam hati: “{keyword}”.`,
    ],
    return: [
      "Kembalikan kesadaran ke ruangan.",
      "Bawa satu hela napas panjang untuk menutup sesi.",
      "Kamu sudah melakukan sesuatu yang berarti untuk dirimu.",
    ],
  },
  focus: {
    arrive: [
      "Duduk tegak namun rileks, sejajarkan tulang belakang.",
      "Tutup mata dan lepaskan hiruk-pikuk sebelum bekerja.",
      "Semua yang perlu dilakukan bisa menunggu beberapa menit.",
    ],
    breatheIn: [
      "Tarik napas dalam, bayangkan udara jernih memasuki kepala.",
      "Rasakan kesegaran di sekitar dahi dan pelipis.",
      "Satu napas, satu titik fokus.",
    ],
    breatheOut: [
      "Hembuskan perlahan, keluarkan kebisingan pikiran.",
      "Daftar tugas bisa menunggu; sekarang kamu melatih perhatian.",
      "Biarkan helaan membersihkan layar mentalmu.",
    ],
    settle: [
      "Pilih satu titik perhatian — napas, suara ambien, atau sensasi duduk.",
      "Saat pikiran melayang, itu bukan kegagalan.",
      "Cukup sadari, lalu kembalikan dengan lembut.",
    ],
    release: [
      "Lepaskan kebutuhan untuk mengerjakan semuanya sekaligus.",
      "Buang rasa buru-buru dari pundakmu.",
      "Fokus tumbuh dari kesabaran, bukan tekanan.",
    ],
    anchor: [
      `Ulangi dalam hati pelan: “{keyword}”.`,
      "Biarkan kata itu menjadi titik pijak pikiranmu.",
      "Rasakan kejernihan yang mulai mengendap.",
    ],
    return: [
      "Tarik satu napas dalam terakhir.",
      "Buka mata saat kamu siap, dengan pikiran yang lebih ringan.",
      "Bawa kejernihan ini ke langkah berikutnya.",
    ],
  },
  confidence: {
    arrive: [
      "Duduk tegak, dada terbuka, bahu rileks.",
      "Tutup mata dan hadiri dirimu sendiri sebagai tamu terhormat.",
      "Kamu layak mengambil ruang ini.",
    ],
    breatheIn: [
      "Tarik napas penuh, seolah mengisi seluruh tubuhmu.",
      "Rasakan energi masuk dari ubun-ubun hingga ujung kaki.",
      "Setiap tarikan menegaskan: kamu ada di sini.",
    ],
    breatheOut: [
      "Hembuskan perlahan dan lepaskan keraguan.",
      "Suara kecil yang meragukanmu bisa diundang keluar.",
      "Kamu lebih mampu daripada yang kamu kira.",
    ],
    settle: [
      "Biarkan tubuh tenggelam dalam dukungan di bawahmu.",
      "Rasakan kekuatan yang tenang di dada.",
      "Tidak perlu membuktikan apa pun kepada siapa pun.",
    ],
    release: [
      "Lepaskan perbandingan dan tuntutan menjadi sempurna.",
      "Kamu tidak perlu memenuhi ekspektasi siapa pun hari ini.",
      "Cukup menjadi dirimu — itu sudah sangat cukup.",
    ],
    anchor: [
      `Ucapkan perlahan dalam hati: “{keyword}”.`,
      "Bayangkan {safePlace}, dan bahwa kamu diterima di sana apa adanya.",
      "Simpan perasaan ini di dalam dadamu.",
    ],
    return: [
      "Tarik napas terakhir yang dalam dan percaya diri.",
      "Buka mata dengan dagu sedikit terangkat.",
      "Bawa keyakinan kecil ini bersamamu ke luar.",
    ],
  },
  relax: {
    arrive: [
      "Duduk atau berbaring dengan posisi paling nyaman bagimu.",
      "Tutup mata dan tarik satu napas lega.",
      "Tidak ada yang harus dicapai di sini.",
    ],
    breatheIn: [
      "Tarik napas dalam yang terasa seperti sips udara segar.",
      "Rasakan perut mengembang pelan.",
      "Nikmati momen kedatangan itu.",
    ],
    breatheOut: [
      "Hembuskan dengan desahan lembut.",
      "Biarkan setiap helaan mengendurkan otot yang tegang.",
      "Rasakan gravitasi menahanmu dengan nyaman.",
    ],
    settle: [
      "Jalankan perhatian perlahan: dahi, rahang, bahu, tangan.",
      "Kendurkan setiap bagian yang kamu temui.",
      "Tubuhmu berhak merasa nyaman tanpa alasan.",
    ],
    release: [
      "Lepaskan obrolan batin yang tidak kamu butuhkan.",
      "Biarkan pikiran melayang bebas seperti awan.",
      "Ketenangan tidak perlu diperjuangkan; cukup diizinkan.",
    ],
    anchor: [
      `Bayangkan {safePlace} dengan semua detailnya.`,
      "Rasakan apa yang kamu syukuri hari ini: {gratitude}.",
      "Biarkan sensasi itu menetap dan menghangatkanmu.",
    ],
    return: [
      "Saat kamu siap, kembalikan kesadaran perlahan.",
      "Gerakkan jari tangan dan kaki dengan lembut.",
      "Bawa ketenangan ini kembali ke harimu.",
    ],
  },
  energy: {
    arrive: [
      "Duduk dengan tulang belakang tegak, atau berdiri jika kamu mau.",
      "Tutup mata dan sambut tubuhmu yang sedang lelah.",
      "Sesi singkat ini untuk mengisi ulangmu.",
    ],
    breatheIn: [
      "Tarik napas penuh dan bertenaga.",
      "Bayangkan cahaya hangat masuk bersama udara.",
      "Setiap tarikan memompa energi ke seluruh tubuh.",
    ],
    breatheOut: [
      "Hembuskan cepat dan ringkas, lepaskan lesu.",
      "Biarkan udara baru datang menggantikan yang lama.",
      "Rasakan sirkulasi hidup mengalir kembali.",
    ],
    settle: [
      "Percepat sedikit ritme napas, biarkan jantung mengikuti.",
      "Rasakan kaki menapak kokoh, tubuh siap bergerak.",
      "Kamu tidak perlu kuat untuk merasa berenergi.",
    ],
    release: [
      "Lepaskan kantuk dan rasa malas dari tubuh.",
      "Lepaskan pikiran bahwa kamu kehabisan tenaga.",
      "Energimu sedang kembali, seteguk demi seteguk.",
    ],
    anchor: [
      `Bisikkan dengan tegas: “{keyword}”.`,
      "Bayangkan {safePlace} di pagi yang cerah, penuh semangat.",
      "Bawa percikan itu ke dalam dadamu.",
    ],
    return: [
      "Tarik satu napas terakhir yang menyegarkan.",
      "Buka mata, rentangkan lengan, regangkan tubuh.",
      "Kamu siap melanjutkan harimu dengan tenaga baru.",
    ],
  },
}

const SCRIPTS_EN: Record<GoalId, PhaseLines> = {
  sleep: {
    arrive: [
      "Sit or lie down as comfortably as you can.",
      "Close your eyes slowly.",
      "Let the room dim gently in your awareness.",
    ],
    breatheIn: [
      "Take a deep breath in through your nose.",
      "Feel the air enter and your lungs expand.",
      "Let your shoulders rise slowly.",
    ],
    breatheOut: [
      "Exhale slowly through your mouth.",
      "Feel the tension leave with it.",
      "Each breath takes you a little closer to sleep.",
    ],
    settle: [
      "Let your breath flow at its own rhythm.",
      "There is nothing you need to do right now.",
      "Your body knows how to relax.",
    ],
    release: [
      "Set down today's list of thoughts, one by one.",
      "Nothing needs to be solved tonight.",
      "Tomorrow will still be there — but not now.",
    ],
    anchor: [
      "Bring your attention to the pause between two breaths.",
      "Repeat softly in your mind: “{keyword}”.",
      "Imagine yourself drifting toward {safePlace}.",
    ],
    return: [
      "There is no rush.",
      "If you feel drowsy, let it happen. Your session is complete.",
      "Return gently to your body, and choose to rest.",
    ],
  },
  stress: {
    arrive: [
      "Sit comfortably with both feet on the floor.",
      "Close your eyes, and admit it: today felt heavy.",
      "You don't have to be okay right now.",
    ],
    breatheIn: [
      "Breathe in slowly through your nose.",
      "Feel the air fill your chest all the way to your belly.",
      "Make room for this heavy day.",
    ],
    breatheOut: [
      "Exhale longer than you inhaled.",
      "Imagine the tension leaving your shoulders and jaw.",
      "No rush — let go again.",
    ],
    settle: [
      "Let your breath return to normal on its own.",
      "Notice the sensations in your body without judging them.",
      "You are enough — exactly as you are, with nothing achieved.",
    ],
    release: [
      "Imagine tension as a blanket you open slowly.",
      "Let go of worries about things that haven't happened yet.",
      "For these few minutes, you are free of all of it.",
    ],
    anchor: [
      "Place one hand on your chest and one on your belly.",
      "Feel the warmth of your own palms.",
      "Whisper to yourself: “{keyword}”.",
    ],
    return: [
      "Bring your awareness back to the room.",
      "Take one long breath to close the session.",
      "You just did something meaningful for yourself.",
    ],
  },
  focus: {
    arrive: [
      "Sit tall yet relaxed, spine aligned.",
      "Close your eyes and release the noise before work.",
      "Everything that needs doing can wait a few minutes.",
    ],
    breatheIn: [
      "Breathe in deeply, imagining clear air entering your head.",
      "Feel the freshness around your forehead and temples.",
      "One breath, one point of focus.",
    ],
    breatheOut: [
      "Exhale slowly, releasing the mental noise.",
      "The to-do list can wait — right now you are training attention.",
      "Let each breath clear your mental screen.",
    ],
    settle: [
      "Choose one point of attention: your breath, the ambient sound, or the sensation of sitting.",
      "When the mind wanders, it is not a failure.",
      "Simply notice, and return gently.",
    ],
    release: [
      "Let go of the need to do everything at once.",
      "Drop the hurry from your shoulders.",
      "Focus grows from patience, not pressure.",
    ],
    anchor: [
      "Repeat slowly in your mind: “{keyword}”.",
      "Let that word be the foothold of your attention.",
      "Feel the clarity settling in.",
    ],
    return: [
      "Take one final deep breath.",
      "Open your eyes when ready, with a lighter mind.",
      "Carry this clarity into your next step.",
    ],
  },
  confidence: {
    arrive: [
      "Sit tall, chest open, shoulders relaxed.",
      "Close your eyes and welcome yourself like an honored guest.",
      "You deserve to take up this space.",
    ],
    breatheIn: [
      "Take a full breath, as if filling your whole body.",
      "Feel energy enter from your crown to your toes.",
      "Each inhale affirms: you are here.",
    ],
    breatheOut: [
      "Exhale slowly and release self-doubt.",
      "The small voice that doubts you may be invited out.",
      "You are more capable than you think.",
    ],
    settle: [
      "Let your body sink into the support beneath you.",
      "Feel a quiet strength in your chest.",
      "There is nothing to prove to anyone.",
    ],
    release: [
      "Let go of comparisons and the demand to be perfect.",
      "You don't need to meet anyone's expectations today.",
      "Simply being you is already enough.",
    ],
    anchor: [
      "Say slowly in your mind: “{keyword}”.",
      "Imagine {safePlace}, where you are accepted as you are.",
      "Keep this feeling safe in your chest.",
    ],
    return: [
      "Take one final deep, confident breath.",
      "Open your eyes with your chin slightly lifted.",
      "Carry this small certainty with you outside.",
    ],
  },
  relax: {
    arrive: [
      "Sit or lie in whatever position feels best for you.",
      "Close your eyes and take one relieved breath.",
      "There is nothing to achieve here.",
    ],
    breatheIn: [
      "Take a deep breath that feels like a sip of fresh air.",
      "Feel your belly expand slowly.",
      "Enjoy the moment of arrival.",
    ],
    breatheOut: [
      "Exhale with a soft sigh.",
      "Let each breath soften the tense muscles.",
      "Feel gravity holding you comfortably.",
    ],
    settle: [
      "Run your attention slowly: forehead, jaw, shoulders, hands.",
      "Relax every part you encounter.",
      "Your body deserves comfort for no reason at all.",
    ],
    release: [
      "Let go of the inner chatter you don't need.",
      "Let thoughts drift like clouds.",
      "Calm doesn't need to be fought for — only allowed.",
    ],
    anchor: [
      "Imagine {safePlace} in all its detail.",
      "Feel what you are grateful for today: {gratitude}.",
      "Let that sensation settle and warm you.",
    ],
    return: [
      "When you're ready, bring your awareness back slowly.",
      "Gently move your fingers and toes.",
      "Carry this calm back into your day.",
    ],
  },
  energy: {
    arrive: [
      "Sit with your spine tall, or stand if you prefer.",
      "Close your eyes and greet your tired body.",
      "This short session is here to recharge you.",
    ],
    breatheIn: [
      "Take a full, vigorous breath.",
      "Imagine warm light entering with the air.",
      "Each inhale pumps energy through your body.",
    ],
    breatheOut: [
      "Exhale quickly and briefly, releasing the heaviness.",
      "Let fresh air replace the old.",
      "Feel the flow of life returning.",
    ],
    settle: [
      "Slightly quicken your breath and let your heart follow.",
      "Feel your feet grounded, your body ready to move.",
      "You don't need to feel strong to feel energized.",
    ],
    release: [
      "Let go of sleepiness and sluggishness.",
      "Release the thought that you are out of energy.",
      "Your energy is returning, sip by sip.",
    ],
    anchor: [
      "Whisper firmly: “{keyword}”.",
      "Picture {safePlace} on a bright morning, full of spirit.",
      "Carry that spark into your chest.",
    ],
    return: [
      "Take one final refreshing breath.",
      "Open your eyes, stretch your arms, roll your shoulders.",
      "You are ready to continue your day with renewed energy.",
    ],
  },
}

const SCRIPTS: Record<Locale, Record<GoalId, PhaseLines>> = {
  id: SCRIPTS_ID,
  en: SCRIPTS_EN,
}

export function buildPhases(
  goal: GoalId,
  locale: Locale,
  values: AnchorValues,
): Phase[] {
  const copy = getAppCopy(locale)
  return PHASE_IDS.map((id) => ({
    id,
    title: copy.session.phaseNames[id],
    lines: SCRIPTS[locale][goal][id].map((line) => interpolate(line, values)),
  }))
}

export function composeSession(input: SessionInput): Session {
  const copy = getAppCopy(input.locale)
  const values: AnchorValues = {
    nickname: (input.nickname ?? "").trim() || DEFAULT_ANCHORS[input.locale].nickname,
    keyword: (input.keyword ?? "").trim() || DEFAULT_ANCHORS[input.locale].keyword,
    safePlace: (input.safePlace ?? "").trim() || DEFAULT_ANCHORS[input.locale].safePlace,
    gratitude: (input.gratitude ?? "").trim() || DEFAULT_ANCHORS[input.locale].gratitude,
  }

  const opening = guideIntro(input.locale, input.guide, values.nickname)
  const phases = buildPhases(input.goal, input.locale, values)
  if (opening) {
    phases[0] = { ...phases[0], lines: [opening, ...phases[0].lines] }
  }

  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    title: `${goalLabel(copy, input.goal)} · ${input.durationMin} ${input.locale === "id" ? "mnt" : "min"}`,
    goal: input.goal,
    guide: input.guide,
    soundMix: {
      nature: [...input.soundMix.nature],
      instruments: [...input.soundMix.instruments],
    },
    durationMin: input.durationMin,
    phases,
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
