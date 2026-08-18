import { describe, expect, it } from "vitest"

import { appCopy, getAppCopy } from "@/lib/i18n/app"

function shape(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(shape).join("|")}]`
  }
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${key}:${shape((value as Record<string, unknown>)[key])}`)
      .join(",")}}`
  }
  return typeof value
}

describe("appCopy", () => {
  it("dictionaries id and en have identical structure", () => {
    expect(shape(appCopy.id)).toBe(shape(appCopy.en))
  })

  it("every string value is non-empty and not padded with whitespace", () => {
    const assertNonEmpty = (value: unknown, path: string) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => assertNonEmpty(item, `${path}[${index}]`))
      } else if (value !== null && typeof value === "object") {
        for (const [key, item] of Object.entries(value)) {
          assertNonEmpty(item, `${path}.${key}`)
        }
      } else if (typeof value === "string") {
        expect(value.trim().length, `${path} should not be empty`).toBeGreaterThan(0)
        expect(value, `${path} should be trimmed`).toBe(value.trim())
      }
    }
    assertNonEmpty(appCopy.id, "id")
    assertNonEmpty(appCopy.en, "en")
  })

  it("defines six goals and four guides", () => {
    for (const locale of ["id", "en"] as const) {
      const copy = appCopy[locale]
      expect(Object.keys(copy.wizard.steps.goal.goals)).toHaveLength(6)
      expect(Object.keys(copy.wizard.steps.guide.guides)).toHaveLength(4)
      expect(Object.keys(copy.wizard.steps.sound.sounds)).toHaveLength(5)
      expect(Object.values(copy.mood.levels)).toHaveLength(5)
    }
  })

  it("defines the same seven phase names in both locales", () => {
    expect(Object.keys(appCopy.id.session.phaseNames)).toEqual(
      Object.keys(appCopy.en.session.phaseNames),
    )
    expect(Object.keys(appCopy.id.session.phaseNames)).toHaveLength(7)
  })
})

describe("getAppCopy", () => {
  it("returns the id dictionary for 'id'", () => {
    expect(getAppCopy("id").dashboard.quickActions.newSession).toBe("Sesi Baru")
    expect(getAppCopy("id").checkin.closing).toBe("Hari ini cukup.")
  })

  it("returns the en dictionary for 'en'", () => {
    expect(getAppCopy("en").dashboard.quickActions.newSession).toBe("New Session")
    expect(getAppCopy("en").checkin.closing).toBe("That's enough for today.")
  })
})
