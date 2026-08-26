import { isAiConfigured, TTS_MODEL, ttsVoice } from "./ai-config"

const TTS_URL = "https://openrouter.ai/api/v1/audio/speech"
const MAX_TEXT_LENGTH = 1200

export type TtsResult =
  | { ok: true; audio: ArrayBuffer; mimeType: string }
  | { ok: false; error: string }

export async function synthesizeSpeech(
  text: string,
  opts?: { voice?: string },
): Promise<TtsResult> {
  if (!isAiConfigured()) return { ok: false, error: "tts not configured" }
  const trimmed = text.trim()
  if (!trimmed) return { ok: false, error: "empty text" }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: "text too long" }
  }

  try {
    const response = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: trimmed,
        response_format: "mp3",
        ...(opts?.voice || ttsVoice()
          ? { voice: opts?.voice ?? ttsVoice() }
          : {}),
      }),
    })

    if (!response.ok) {
      let detail = `TTS ${response.status}`
      try {
        const body = (await response.json()) as { error?: { message?: string } }
        if (body?.error?.message) detail = `${detail}: ${body.error.message}`
      } catch {
        // response body bukan JSON — biarkan pesan default
      }
      return { ok: false, error: detail }
    }

    const audio = await response.arrayBuffer()
    return {
      ok: true,
      audio,
      mimeType: response.headers.get("content-type") ?? "audio/mpeg",
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown error",
    }
  }
}