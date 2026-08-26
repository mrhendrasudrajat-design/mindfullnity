import { requireUser } from "@/lib/supabase/dal"
import { synthesizeSpeech } from "@/lib/tts"

const CACHE_LIMIT = 128

function hashText(text: string): string {
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0
  }
  return `t${hash.toString(36)}`
}

const cache = new Map<string, ArrayBuffer>()

export async function POST(request: Request) {
  await requireUser()

  let body: { text?: unknown; voice?: unknown }
  try {
    body = (await request.json()) as { text?: unknown; voice?: unknown }
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 })
  }

  const text = typeof body.text === "string" ? body.text.trim() : ""
  if (!text) {
    return Response.json({ error: "empty text" }, { status: 400 })
  }

  const key = hashText(text)
  const cached = cache.get(key)
  if (cached) {
    return new Response(cached, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600" },
    })
  }

  const result = await synthesizeSpeech(text, {
    voice: typeof body.voice === "string" ? body.voice : undefined,
  })

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 })
  }

  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, result.audio)

  return new Response(result.audio, {
    headers: {
      "Content-Type": result.mimeType,
      "Cache-Control": "private, max-age=3600",
    },
  })
}