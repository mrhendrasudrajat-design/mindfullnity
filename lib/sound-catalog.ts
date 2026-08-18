export type SoundCategory = "nature" | "instruments"

export type NatureSoundId = "rain" | "ocean" | "forest" | "wind" | "night"
export type InstrumentSoundId = "softPads" | "musicBox"
export type SoundId = NatureSoundId | InstrumentSoundId

export type SoundItem<T extends SoundId = SoundId> = {
  id: T
  category: SoundCategory
  labelKey: string
  defaultVolume: number
}

const NATURE_SOUNDS_DEFS: SoundItem<NatureSoundId>[] = [
  { id: "rain", category: "nature", labelKey: "rain", defaultVolume: 0.4 },
  { id: "ocean", category: "nature", labelKey: "ocean", defaultVolume: 0.45 },
  { id: "forest", category: "nature", labelKey: "forest", defaultVolume: 0.4 },
  { id: "wind", category: "nature", labelKey: "wind", defaultVolume: 0.35 },
  { id: "night", category: "nature", labelKey: "night", defaultVolume: 0.3 },
]

const INSTRUMENT_SOUNDS_DEFS: SoundItem<InstrumentSoundId>[] = [
  { id: "softPads", category: "instruments", labelKey: "softPads", defaultVolume: 0.3 },
  { id: "musicBox", category: "instruments", labelKey: "musicBox", defaultVolume: 0.25 },
]

export const SOUND_CATALOG: SoundItem[] = [
  ...NATURE_SOUNDS_DEFS,
  ...INSTRUMENT_SOUNDS_DEFS,
]

export const NATURE_SOUNDS = NATURE_SOUNDS_DEFS
export const INSTRUMENT_SOUNDS = INSTRUMENT_SOUNDS_DEFS

export function getSound(id: string): SoundItem | undefined {
  return SOUND_CATALOG.find((sound) => sound.id === id)
}