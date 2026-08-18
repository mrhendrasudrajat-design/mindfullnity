import { describe, expect, it } from "vitest"

import {
  getSound,
  INSTRUMENT_SOUNDS,
  NATURE_SOUNDS,
  SOUND_CATALOG,
} from "@/lib/sound-catalog"

describe("sound-catalog", () => {
  it("lists nature sounds before instruments", () => {
    expect(NATURE_SOUNDS).toHaveLength(5)
    expect(INSTRUMENT_SOUNDS).toHaveLength(2)
    expect(SOUND_CATALOG).toHaveLength(7)
  })

  it("has unique ids with valid defaults", () => {
    const ids = new Set(SOUND_CATALOG.map((sound) => sound.id))
    expect(ids.size).toBe(SOUND_CATALOG.length)
    for (const sound of SOUND_CATALOG) {
      expect(sound.defaultVolume).toBeGreaterThanOrEqual(0)
      expect(sound.defaultVolume).toBeLessThanOrEqual(1)
    }
  })

  it("getSound finds entries by id and returns undefined otherwise", () => {
    expect(getSound("rain")?.category).toBe("nature")
    expect(getSound("musicBox")?.category).toBe("instruments")
    expect(getSound("unknown")).toBeUndefined()
  })
})