import { getSound, type SoundId } from "./sound-catalog"

function createNoiseBuffer(ctx: AudioContext, type: "white" | "pink" | "brown") {
  const length = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  let b0 = 0
  let b1 = 0
  let b2 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    if (type === "white") {
      data[i] = white
    } else if (type === "pink") {
      b0 = 0.99765 * b0 + white * 0.099046
      b1 = 0.963 * b1 + white * 0.2965164
      b2 = 0.57 * b2 + white * 1.0526913
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.35
    } else {
      b0 = 0.98 * b0 + white * 0.02
      data[i] = b0 * 3.5
    }
  }
  return buffer
}

type SoundTrack = {
  start: () => void
  stop: () => void
  setVolume: (volume: number) => void
  dispose?: () => void
}

function connectGain(ctx: AudioContext) {
  const gain = ctx.createGain()
  gain.gain.value = 0
  gain.connect(ctx.destination)
  return gain
}

function fadeGain(gain: GainNode, target: number, seconds = 0.8) {
  const ctx = gain.context
  const now = ctx.currentTime
  gain.gain.cancelScheduledValues(now)
  gain.gain.setValueAtTime(gain.gain.value, now)
  gain.gain.linearRampToValueAtTime(target, now + seconds)
}

function noiseTrack(
  ctx: AudioContext,
  type: "white" | "pink" | "brown",
  filterType: BiquadFilterType,
  frequency: number,
  volume: number,
): SoundTrack {
  const buffer = createNoiseBuffer(ctx, type)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = frequency

  const gain = connectGain(ctx)
  source.connect(filter)
  filter.connect(gain)

  return {
    start: () => {
      source.start()
      fadeGain(gain, volume)
    },
    stop: () => {
      fadeGain(gain, 0)
    },
    setVolume: (v: number) => fadeGain(gain, v, 0.2),
    dispose: () => {
      try {
        source.stop()
      } catch {
        // sudah berhenti
      }
      source.disconnect()
      filter.disconnect()
      gain.disconnect()
    },
  }
}

function lfoTrack(
  ctx: AudioContext,
  type: "white" | "pink" | "brown",
  filterType: BiquadFilterType,
  baseFrequency: number,
  lfoRate: number,
  lfoDepth: number,
  volume: number,
): SoundTrack {
  const buffer = createNoiseBuffer(ctx, type)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = baseFrequency

  const gain = connectGain(ctx)
  source.connect(filter)
  filter.connect(gain)

  const lfo = ctx.createOscillator()
  lfo.frequency.value = lfoRate
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = lfoDepth
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)

  return {
    start: () => {
      source.start()
      lfo.start()
      fadeGain(gain, volume)
    },
    stop: () => {
      fadeGain(gain, 0)
    },
    setVolume: (v: number) => fadeGain(gain, v, 0.2),
    dispose: () => {
      try {
        source.stop()
        lfo.stop()
      } catch {
        // sudah berhenti
      }
      source.disconnect()
      filter.disconnect()
      lfo.disconnect()
      lfoGain.disconnect()
      gain.disconnect()
    },
  }
}

const MELODY = [523.25, 659.25, 783.99, 659.25, 523.25, 392.0]

function musicBoxTrack(ctx: AudioContext, volume: number): SoundTrack {
  const gain = connectGain(ctx)
  let timer: ReturnType<typeof setTimeout> | null = null
  let step = 0
  let stopped = false
  const activeNotes = new Set<OscillatorNode>()

  const playNote = (frequency: number) => {
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.value = frequency
    const noteGain = ctx.createGain()
    noteGain.gain.setValueAtTime(0.0001, ctx.currentTime)
    noteGain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7)
    osc.connect(noteGain)
    noteGain.connect(gain)
    activeNotes.add(osc)
    osc.onended = () => {
      activeNotes.delete(osc)
      try {
        osc.disconnect()
        noteGain.disconnect()
      } catch {
        // sudah dilepas
      }
    }
    osc.start()
    osc.stop(ctx.currentTime + 0.75)
  }

  return {
    start: () => {
      stopped = false
      step = 0
      fadeGain(gain, volume)
      const loop = () => {
        if (stopped) return
        playNote(MELODY[step % MELODY.length])
        step += 1
        timer = setTimeout(loop, 420)
      }
      loop()
    },
    stop: () => {
      stopped = true
      if (timer) clearTimeout(timer)
      fadeGain(gain, 0)
    },
    setVolume: (v: number) => fadeGain(gain, v, 0.2),
    dispose: () => {
      for (const osc of activeNotes) {
        try {
          osc.stop()
        } catch {
          // sudah berhenti
        }
      }
      activeNotes.clear()
      gain.disconnect()
    },
  }
}

const TRACKS: Record<SoundId, (ctx: AudioContext, volume: number) => SoundTrack> = {
  rain: (ctx, volume) =>
    noiseTrack(ctx, "white", "lowpass", 1200, volume),
  ocean: (ctx, volume) =>
    lfoTrack(ctx, "pink", "lowpass", 500, 0.08, 240, volume),
  forest: (ctx, volume) =>
    lfoTrack(ctx, "pink", "bandpass", 900, 0.12, 300, volume),
  wind: (ctx, volume) =>
    lfoTrack(ctx, "pink", "lowpass", 320, 0.05, 160, volume),
  night: (ctx, volume) =>
    noiseTrack(ctx, "brown", "lowpass", 400, volume * 0.6),
  softPads: (ctx, volume) => {
    const gain = connectGain(ctx)
    const freqs = [196.0, 246.94, 293.66]
    const oscillators = freqs.map((frequency, index) => {
      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.value = frequency
      osc.detune.value = index === 0 ? -6 : index === 1 ? 4 : 8
      const oscGain = ctx.createGain()
      oscGain.gain.value = 0.18
      osc.connect(oscGain)
      oscGain.connect(gain)
      osc.start()
      return osc
    })
    return {
      start: () => fadeGain(gain, volume),
      stop: () => {
        fadeGain(gain, 0)
      },
      setVolume: (v: number) => fadeGain(gain, v, 0.2),
      dispose: () => {
        for (const osc of oscillators) {
          try {
            osc.stop()
          } catch {
            // sudah berhenti
          }
          osc.disconnect()
        }
        gain.disconnect()
      },
    }
  },
  musicBox: (ctx, volume) => musicBoxTrack(ctx, volume),
}

export class SoundEngine {
  private ctx: AudioContext | null = null
  private tracks = new Map<SoundId, SoundTrack>()

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx
    if (typeof window === "undefined" || !("AudioContext" in window)) return null
    const Ctor = window.AudioContext
    this.ctx = new Ctor()
    return this.ctx
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && "AudioContext" in window
  }

  async start(id: SoundId, volume?: number): Promise<void> {
    const meta = getSound(id)
    if (!meta) return
    const ctx = this.ensureContext()
    if (!ctx) return
    if (this.tracks.has(id)) return
    await ctx.resume()
    const track = TRACKS[id](ctx, volume ?? meta.defaultVolume)
    this.tracks.set(id, track)
    track.start()
  }

  stop(id: SoundId): void {
    const track = this.tracks.get(id)
    if (!track) return
    this.tracks.delete(id)
    track.stop()
    window.setTimeout(() => track.dispose?.(), 950)
    this.scheduleContextClose()
  }

  private scheduleContextClose(): void {
    if (this.tracks.size > 0) return
    const ctx = this.ctx
    if (!ctx) return
    window.setTimeout(() => {
      if (this.tracks.size === 0) {
        void ctx.close().catch(() => {
          // konteks sudah ditutup
        })
        this.ctx = null
      }
    }, 1200)
  }

  setVolume(id: SoundId, volume: number): void {
    this.tracks.get(id)?.setVolume(volume)
  }

  stopAll(): void {
    for (const id of [...this.tracks.keys()]) this.stop(id)
  }
}

export const soundEngine = new SoundEngine()