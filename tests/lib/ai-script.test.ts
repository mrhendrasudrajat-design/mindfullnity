import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { generateScript, parseScriptJson } from "@/lib/ai-script"
import { composeSession, PHASE_IDS, type Phase } from "@/lib/templates"

const fetchMock = vi.fn()

function jsonResponse(content: string, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
  } as Response
}

const INPUT = {
  goal: "stress" as const,
  guide: "mentor" as const,
  soundMix: { nature: ["rain"], instruments: [] },
  durationMin: 10,
  locale: "id" as const,
  nickname: "Alya",
  keyword: "tenang",
  safePlace: "kamar",
  gratitude: "segelas air",
}

function validJson() {
  return JSON.stringify({
    phases: PHASE_IDS.map((id) => ({
      id,
      title: id,
      lines: [`baris satu ${id}`, `baris dua ${id}`, `baris tiga ${id}`],
    })),
  })
}

function fallbackPhases(): Phase[] {
  return composeSession({
    goal: INPUT.goal,
    guide: INPUT.guide,
    soundMix: INPUT.soundMix,
    durationMin: INPUT.durationMin,
    locale: INPUT.locale,
    nickname: INPUT.nickname,
    keyword: INPUT.keyword,
    safePlace: INPUT.safePlace,
    gratitude: INPUT.gratitude,
  }).phases
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  process.env.OPENROUTER_API_KEY = "test-key"
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.OPENROUTER_API_KEY
})

describe("generateScript", () => {
  it("memakai template lokal saat API key belum diatur", async () => {
    delete process.env.OPENROUTER_API_KEY
    const phases = await generateScript(INPUT)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(phases).toEqual(fallbackPhases())
  })

  it("memanggil OpenRouter dengan bentuk request yang benar", async () => {
    fetchMock.mockResolvedValue(jsonResponse(validJson()))
    await generateScript(INPUT)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions")
    expect(init.method).toBe("POST")
    expect(init.headers).toMatchObject({
      Authorization: "Bearer test-key",
      "Content-Type": "application/json",
    })
    const body = JSON.parse(String(init.body)) as Record<string, unknown>
    expect(body.model).toBe("z-ai/glm-5.2:free")
    expect(body.route).toBe("fallback")
    expect(body.response_format).toEqual({ type: "json_object" })
    expect(body.models).toContain("z-ai/glm-5.2:free")
    const messages = body.messages as { role: string; content: string }[]
    expect(messages.some((m) => m.content.includes("Alya"))).toBe(true)
    expect(messages.some((m) => m.content.includes("tenang"))).toBe(true)
  })

  it("mengembalikan 7 fase valid dari respons LLM", async () => {
    fetchMock.mockResolvedValue(jsonResponse(validJson()))
    const phases = await generateScript(INPUT)

    expect(phases).toHaveLength(7)
    expect(phases.map((p) => p.id)).toEqual([...PHASE_IDS])
    expect(phases[0].lines[0]).toBe("baris satu arrive")
  })

  it("fallback ke template saat JSON tidak valid", async () => {
    fetchMock.mockResolvedValue(jsonResponse("Maaf, saya tidak bisa membantu."))
    const phases = await generateScript(INPUT)
    expect(phases).toEqual(fallbackPhases())
  })

  it("fallback ke template saat respons error", async () => {
    fetchMock.mockResolvedValue(jsonResponse("", 500))
    const phases = await generateScript(INPUT)
    expect(phases).toEqual(fallbackPhases())
  })

  it("fallback ke template saat fetch gagal (network)", async () => {
    fetchMock.mockRejectedValue(new Error("network down"))
    const phases = await generateScript(INPUT)
    expect(phases).toEqual(fallbackPhases())
  })
})

describe("parseScriptJson", () => {
  it("menolak JSON tanpa objek", () => {
    expect(parseScriptJson("bukan json", "id")).toBeNull()
  })

  it("menolak fase yang tidak lengkap", () => {
    const partial = JSON.stringify({ phases: PHASE_IDS.slice(0, 3).map((id) => ({ id, title: id, lines: ["x"] })) })
    expect(parseScriptJson(partial, "id")).toBeNull()
  })

  it("menolak id fase yang tidak dikenal", () => {
    const bad = JSON.stringify({
      phases: [...PHASE_IDS.slice(0, 6).map((id) => ({ id, title: id, lines: ["x"] })), { id: "bogus", title: "x", lines: ["y"] }],
    })
    expect(parseScriptJson(bad, "id")).toBeNull()
  })

  it("membersihkan baris kosong dan membatasi panjang", () => {
    const raw = JSON.stringify({
      phases: PHASE_IDS.map((id, index) => ({
        id,
        title: id,
        lines: index === 0 ? ["", "  valid  ", "a".repeat(500), "baris ketiga"] : ["x"],
      })),
    })
    const phases = parseScriptJson(raw, "id")
    expect(phases).not.toBeNull()
    const first = phases![0]
    expect(first.lines).toEqual(["valid", "a".repeat(220), "baris ketiga"])
    expect(first.lines.every((line) => line.length <= 220)).toBe(true)
  })

  it("menjaga urutan fase sesuai PHASE_IDS", () => {
    const shuffled = [...PHASE_IDS].reverse()
    const raw = JSON.stringify({
      phases: shuffled.map((id) => ({ id, title: id, lines: ["x"] })),
    })
    const phases = parseScriptJson(raw, "id")
    expect(phases?.map((p) => p.id)).toEqual([...PHASE_IDS])
  })
})