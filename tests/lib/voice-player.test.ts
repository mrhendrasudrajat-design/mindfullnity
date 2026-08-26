import { beforeEach, describe, expect, it, vi } from "vitest"

import { VoicePlayer, type VoiceStatus } from "@/lib/voice-player"

const state = vi.hoisted(() => ({
  audios: [] as MockAudio[],
}))

class MockAudio {
  src = ""
  preload = ""
  volume = 1
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  play = vi.fn(() => Promise.resolve())
  pause = vi.fn()
  removeAttribute = vi.fn()

  constructor() {
    state.audios.push(this)
  }

  fireEnded() {
    this.onended?.()
  }

  fireError() {
    this.onerror?.()
  }
}

const fetchMock = vi.fn()
const createObjectURL = vi.fn(() => "blob:mock-audio")
const revokeObjectURL = vi.fn()

function ttsResponse() {
  return {
    ok: true,
    status: 200,
    blob: async () => new Blob(["x"], { type: "audio/mpeg" }),
  } as Response
}

beforeEach(() => {
  state.audios = []
  fetchMock.mockReset()
  fetchMock.mockResolvedValue(ttsResponse())
  vi.stubGlobal("fetch", fetchMock)
  vi.stubGlobal("URL", {
    createObjectURL,
    revokeObjectURL,
  } as unknown as typeof URL)
  vi.stubGlobal("Audio", MockAudio)
})

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe("VoicePlayer", () => {
  it("memainkan satu segmen: fetch → audio → status idle", async () => {
    const player = new VoicePlayer()
    const statuses: VoiceStatus[] = []
    player.subscribe(() => statuses.push(player.getStatus()))

    const promise = player.play(["halo, kamu"])
    await flush()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tts",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "halo, kamu" }),
      }),
    )
    const audio = state.audios[0]
    expect(audio.src).toBe("blob:mock-audio")
    expect(player.getStatus()).toBe("playing")
    expect(statuses).toContain("loading")

    audio.fireEnded()
    await promise

    expect(player.getStatus()).toBe("idle")
  })

  it("memainkan beberapa segmen berurutan", async () => {
    const player = new VoicePlayer()
    const promise = player.play(["segmen satu", "segmen dua"])
    await flush()

    const audio = state.audios[0]
    audio.fireEnded()
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(audio.src).toBe("blob:mock-audio")
    expect(player.getStatus()).toBe("playing")

    audio.fireEnded()
    await promise
    expect(player.getStatus()).toBe("idle")
  })

  it("cache per teks — teks yang sama tidak di-fetch ulang", async () => {
    const player = new VoicePlayer()
    const first = player.play(["sama"])
    await flush()
    state.audios[0].fireEnded()
    await first

    const second = player.play(["sama"])
    await flush()
    state.audios[0].fireEnded()
    await second

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("stop menghentikan antrian dan status kembali idle", async () => {
    const player = new VoicePlayer()
    const promise = player.play(["a", "b", "c"])
    await flush()

    player.stop()
    await flush()

    expect(player.getStatus()).toBe("idle")
    expect(state.audios[0].pause).toHaveBeenCalled()
    await promise
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("pause dan resume mempertahankan segmen aktif", async () => {
    const player = new VoicePlayer()
    const promise = player.play(["a", "b"])
    await flush()

    player.pause()
    expect(player.getStatus()).toBe("paused")
    expect(state.audios[0].pause).toHaveBeenCalled()

    player.resume()
    expect(player.getStatus()).toBe("playing")
    expect(state.audios[0].play).toHaveBeenCalledTimes(2)

    state.audios[0].fireEnded()
    await flush()
    state.audios[0].fireEnded()
    await promise
    expect(player.getStatus()).toBe("idle")
  })

  it("segmen gagal dilewati tanpa menghentikan antrian", async () => {
    fetchMock.mockRejectedValueOnce(new Error("down"))
    const player = new VoicePlayer()
    const promise = player.play(["gagal", "oke"])
    await flush()

    expect(player.getStatus()).toBe("playing")
    expect(state.audios[0].src).toBe("blob:mock-audio")

    state.audios[0].fireEnded()
    await promise
    expect(player.getStatus()).toBe("idle")
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("prefetch menyimpan cache tanpa memainkan audio", async () => {
    const player = new VoicePlayer()
    await player.prefetch("nanti")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(state.audios).toHaveLength(0)

    const promise = player.play(["nanti"])
    await flush()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    state.audios[0].fireEnded()
    await promise
  })

  it("subscribe mengembalikan unsubscribe", async () => {
    const player = new VoicePlayer()
    const listener = vi.fn()
    const unsubscribe = player.subscribe(listener)
    unsubscribe()
    const promise = player.play(["x"])
    await flush()
    state.audios[0].fireEnded()
    await promise
    expect(listener).not.toHaveBeenCalled()
  })
})