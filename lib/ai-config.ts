export const SCRIPT_MODELS = [
  "z-ai/glm-5.2:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "minimax/minimax-m2.7:free",
] as const

export const TTS_MODEL = "fish-audio/s2.1-pro-free:free"

export function scriptModel(): string {
  return process.env.OPENROUTER_SCRIPT_MODEL?.trim() || SCRIPT_MODELS[0]
}

export function ttsVoice(): string | undefined {
  const voice = process.env.OPENROUTER_TTS_VOICE?.trim()
  return voice || undefined
}

export function isAiConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY
  return typeof key === "string" && key.length > 0
}