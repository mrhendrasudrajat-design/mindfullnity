import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { synthesizeSpeech } from "@/lib/tts"

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  process.env.OPENROUTER_API_KEY = "test-key"
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.OPENROUTER_API_KEY
})

function audioResponse(status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name: string) => (name === "content-type" ? "audio/mpeg" : null) },
    arrayBuffer: async () => new ArrayBuffer(8),
    json: async () => ({ error: { message: "provider menolak" } }),
  } as Response
}

describe("synthesizeSpeech", () => {
  it("mengembalikan audio mp3 pada respons sukses", async () => {
    fetchMock.mockResolvedValue(audioResponse())
    const result = await synthesizeSpeech("Halo, Alya. Tarik napas.")

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.audio.byteLength).toBe(8)
      expect(result.mimeType).toBe("audio/mpeg")
    }
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("https://openrouter.ai/api/v1/audio/speech")
    expect(init.method).toBe("POST")
    expect(init.headers).toMatchObject({
      Authorization: "Bearer test-key",
    })
    const body = JSON.parse(String(init.body)) as Record<string, unknown>
    expect(body.model).toBe("fish-audio/s2.1-pro-free:free")
    expect(body.input).toBe("Halo, Alya. Tarik napas.")
    expect(body.response_format).toBe("mp3")
  })

  it("tidak memanggil fetch saat API key belum diatur", async () => {
    delete process.env.OPENROUTER_API_KEY
    const result = await synthesizeSpeech("Halo")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result).toEqual({ ok: false, error: "tts not configured" })
  })

  it("menolak teks kosong", async () => {
    const result = await synthesizeSpeech("   ")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.ok).toBe(false)
  })

  it("menolak teks terlalu panjang", async () => {
    const result = await synthesizeSpeech("a".repeat(1201))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.ok).toBe(false)
  })

  it("memetakan error provider ke hasil gagal", async () => {
    fetchMock.mockResolvedValue(audioResponse(429))
    const result = await synthesizeSpeech("Halo")
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain("429")
  })

  it("memetakan kegagalan jaringan ke hasil gagal", async () => {
    fetchMock.mockRejectedValue(new Error("timeout"))
    const result = await synthesizeSpeech("Halo")
    expect(result).toEqual({ ok: false, error: "timeout" })
  })
})