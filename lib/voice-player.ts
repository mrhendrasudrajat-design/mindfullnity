export type VoiceStatus = "idle" | "loading" | "playing" | "paused" | "error"

const TTS_URL = "/api/tts"
const MAX_CACHE_ENTRIES = 24

export class VoicePlayer {
  private audio: HTMLAudioElement | null = null
  private cache = new Map<string, string>()
  private texts: string[] = []
  private index = 0
  private generation = 0
  private status: VoiceStatus = "idle"
  private listeners = new Set<() => void>()
  private endResolver: (() => void) | null = null

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getStatus(): VoiceStatus {
    return this.status
  }

  private setStatus(status: VoiceStatus) {
    if (this.status === status) return
    this.status = status
    for (const listener of this.listeners) listener()
  }

  protected createAudio(): HTMLAudioElement {
    const audio = new Audio()
    audio.preload = "auto"
    audio.volume = 1
    return audio
  }

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) this.audio = this.createAudio()
    return this.audio
  }

  private async fetchUrl(text: string): Promise<string> {
    const cached = this.cache.get(text)
    if (cached) return cached

    const response = await fetch(TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) {
      throw new Error(`tts ${response.status}`)
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = this.cache.keys().next().value
      if (oldest !== undefined) {
        const oldUrl = this.cache.get(oldest)
        this.cache.delete(oldest)
        if (oldUrl) URL.revokeObjectURL(oldUrl)
      }
    }
    this.cache.set(text, url)
    return url
  }

  async prefetch(text: string): Promise<void> {
    if (!text || this.cache.has(text)) return
    try {
      await this.fetchUrl(text)
    } catch {
      // prefetch gagal — abaikan, akan dicoba lagi saat dibutuhkan
    }
  }

  async prefetchAll(texts: string[], batchSize = 3): Promise<void> {
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      await Promise.all(batch.map((text) => this.prefetch(text)))
    }
  }

  async play(texts: string[]): Promise<void> {
    this.generation += 1
    this.texts = [...texts]
    this.index = 0
    const gen = this.generation
    this.releasePending()
    if (this.audio) {
      this.audio.pause()
      this.audio.removeAttribute("src")
    }
    this.setStatus("loading")
    await this.speakNext(gen)
  }

  pause(): void {
    if (this.status !== "playing") return
    this.audio?.pause()
    this.setStatus("paused")
  }

  resume(): void {
    if (this.status !== "paused") return
    void this.audio?.play()
    this.setStatus("playing")
  }

  stop(): void {
    this.generation += 1
    this.texts = []
    this.index = 0
    this.releasePending()
    if (this.audio) {
      this.audio.pause()
      this.audio.removeAttribute("src")
    }
    this.setStatus("idle")
  }

  private releasePending(): void {
    const resolve = this.endResolver
    this.endResolver = null
    resolve?.()
  }

  private async speakNext(gen: number): Promise<void> {
    if (gen !== this.generation) return
    if (this.index >= this.texts.length) {
      this.setStatus("idle")
      return
    }

    const text = this.texts[this.index]
    let url: string
    try {
      this.setStatus("loading")
      url = await this.fetchUrl(text)
    } catch {
      if (gen !== this.generation) return
      this.setStatus("error")
      this.index += 1
      await this.speakNext(gen)
      return
    }

    if (gen !== this.generation) return
    const audio = this.ensureAudio()
    this.setStatus("playing")

    await new Promise<void>((resolve) => {
      this.endResolver = resolve
      const finish = () => {
        this.endResolver = null
        resolve()
      }
      audio.onended = finish
      audio.onerror = finish
      audio.src = url
      void audio.play().catch(finish)
    })

    if (gen !== this.generation) return
    this.index += 1
    await this.speakNext(gen)
  }
}

export const voicePlayer = new VoicePlayer()