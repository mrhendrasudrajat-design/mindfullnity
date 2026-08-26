import { getAppCopy } from "@/lib/i18n/app"
import type { Locale } from "@/lib/i18n/locale"
import {
  composeSession,
  PHASE_IDS,
  type GoalId,
  type GuideId,
  type Phase,
  type PhaseId,
  type SoundMix,
} from "@/lib/templates"
import { isAiConfigured, SCRIPT_MODELS, scriptModel } from "./ai-config"

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const REQUEST_TIMEOUT_MS = 45_000
const MAX_LINES_PER_PHASE = 6
const MAX_LINE_LENGTH = 220

const DEFAULT_ANCHORS: Record<Locale, Record<string, string>> = {
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

export type ScriptInput = {
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

function resolveAnchors(input: ScriptInput): Record<string, string> {
  const fallback = DEFAULT_ANCHORS[input.locale]
  return {
    nickname: input.nickname?.trim() || fallback.nickname,
    keyword: input.keyword?.trim() || fallback.keyword,
    safePlace: input.safePlace?.trim() || fallback.safePlace,
    gratitude: input.gratitude?.trim() || fallback.gratitude,
  }
}

function buildPrompt(input: ScriptInput): { system: string; user: string } {
  const copy = getAppCopy(input.locale)
  const anchors = resolveAnchors(input)
  const goal = copy.wizard.steps.goal.goals[input.goal]
  const guide = copy.wizard.steps.guide.guides[input.guide]
  const isId = input.locale === "id"
  const phaseIds = PHASE_IDS.join(", ")

  const system = isId
    ? [
        "Kamu adalah penulis skrip meditasi terpandu yang hangat dan menenangkan.",
        `Tulis seluruh skrip dalam Bahasa Indonesia.`,
        `Tujuan sesi: ${goal.title} — ${goal.description}.`,
        `Persona guide: ${guide.title} (${guide.description}). Bayangkan guide berbicara langsung kepada ${anchors.nickname} dengan nada yang sesuai persona.`,
        "Buat skrip 7 fase dengan urutan dan id persis: " + phaseIds + ".",
        "Setiap fase berisi 3–4 kalimat pendek dan sederhana (bukan paragraf).",
        "Nada: pelan, hangat, tanpa tekanan, tanpa kata 'harus' yang menghakimi.",
        `Sisipkan anchor secara alami: kata kunci "${anchors.keyword}", tempat aman "${anchors.safePlace}", rasa syukur "${anchors.gratitude}".`,
        `Durasi sesi ${input.durationMin} menit — sesuaikan ritme kalimat.`,
        'Keluarkan HANYA JSON tanpa markdown: {"phases":[{"id":"arrive","title":"Kedatangan","lines":["kalimat satu","kalimat dua","kalimat tiga"]}, ...]} — id harus salah satu dari: ' +
          phaseIds +
          ".",
      ].join("\n")
    : [
        "You are a warm, soothing guided-meditation scriptwriter.",
        "Write the entire script in English.",
        `Session goal: ${goal.title} — ${goal.description}.`,
        `Guide persona: ${guide.title} (${guide.description}). Imagine the guide speaking directly to ${anchors.nickname} in a voice that fits the persona.`,
        "Create a 7-phase script with these exact ids in order: " + phaseIds + ".",
        "Each phase has 3–4 short, simple sentences (not paragraphs).",
        "Tone: slow, warm, pressure-free, never judgmental.",
        `Weave the anchors in naturally: keyword "${anchors.keyword}", safe place "${anchors.safePlace}", gratitude "${anchors.gratitude}".`,
        `Session duration is ${input.durationMin} minutes — pace the sentences accordingly.`,
        'Output ONLY JSON, no markdown: {"phases":[{"id":"arrive","title":"Arrive","lines":["sentence one","sentence two","sentence three"]}, ...]} — ids must be one of: ' +
          phaseIds +
          ".",
      ].join("\n")

  const user = isId
    ? `Tuliskan skrip meditasi ${input.durationMin} menit untuk tujuan "${goal.title}" dengan persona "${guide.title}".`
    : `Write the ${input.durationMin}-minute meditation script for the goal "${goal.title}" with the "${guide.title}" persona.`

  return { system, user }
}

export function parseScriptJson(text: string, locale: Locale): Phase[] | null {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0]) as {
      phases?: { id?: string; title?: string; lines?: unknown }[]
    }
    if (!Array.isArray(parsed.phases) || parsed.phases.length < PHASE_IDS.length) {
      return null
    }
    const copy = getAppCopy(locale)
    const byId = new Map<string, Phase>()
    for (const raw of parsed.phases) {
      if (typeof raw?.id !== "string") continue
      const id = raw.id as PhaseId
      if (!PHASE_IDS.includes(id)) continue
      if (!Array.isArray(raw.lines)) continue
      const lines = raw.lines
        .filter((line): line is string => typeof line === "string")
        .map((line) => line.trim().slice(0, MAX_LINE_LENGTH))
        .filter((line) => line.length > 0)
        .slice(0, MAX_LINES_PER_PHASE)
      if (lines.length === 0) continue
      byId.set(id, {
        id,
        title:
          typeof raw.title === "string" && raw.title.trim().length > 0
            ? raw.title.trim().slice(0, 60)
            : copy.session.phaseNames[id],
        lines,
      })
    }
    const phases: Phase[] = []
    for (const id of PHASE_IDS) {
      const phase = byId.get(id)
      if (!phase) return null
      phases.push(phase)
    }
    return phases
  } catch {
    return null
  }
}

function fallbackPhases(input: ScriptInput): Phase[] {
  return composeSession({
    goal: input.goal,
    guide: input.guide,
    soundMix: input.soundMix,
    durationMin: input.durationMin,
    locale: input.locale,
    nickname: input.nickname,
    keyword: input.keyword,
    safePlace: input.safePlace,
    gratitude: input.gratitude,
  }).phases
}

export async function generateScript(input: ScriptInput): Promise<Phase[]> {
  if (!isAiConfigured()) return fallbackPhases(input)

  const { system, user } = buildPrompt(input)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: scriptModel(),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        route: "fallback",
        models: [...SCRIPT_MODELS],
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`OpenRouter ${response.status}`)
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content ?? ""
    const phases = parseScriptJson(content, input.locale)
    if (!phases) throw new Error("invalid script JSON")
    return phases
  } catch (error) {
    console.error("[ai-script] gagal, pakai template:", error)
    return fallbackPhases(input)
  } finally {
    clearTimeout(timer)
  }
}