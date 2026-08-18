import { describe, expect, it } from "vitest"

import { getLandingCopy, landingCopy } from "@/lib/i18n/landing"

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

describe("landingCopy", () => {
  it("dictionaries id and en have identical structure", () => {
    expect(shape(landingCopy.id)).toBe(shape(landingCopy.en))
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
    assertNonEmpty(landingCopy.id, "id")
    assertNonEmpty(landingCopy.en, "en")
  })

  it("both locales define exactly three features and three steps", () => {
    for (const locale of ["id", "en"] as const) {
      const copy = landingCopy[locale]
      expect(copy.features.items).toHaveLength(3)
      expect(copy.howItWorks.steps).toHaveLength(3)
      expect(copy.nav.links).toHaveLength(5)
    }
  })

  it("brand name appears in both footer taglines", () => {
    expect(landingCopy.id.footer.tagline).toContain("Mindfulnity")
    expect(landingCopy.en.footer.tagline).toContain("Mindfulnity")
  })
})

describe("getLandingCopy", () => {
  it("returns the id dictionary for 'id'", () => {
    expect(getLandingCopy("id").nav.start).toBe("Mulai")
    expect(getLandingCopy("id").hero.headlineStart).toBe("Tenang dimulai dari")
  })

  it("returns the en dictionary for 'en'", () => {
    expect(getLandingCopy("en").nav.start).toBe("Start")
    expect(getLandingCopy("en").hero.headlineStart).toBe("Calm starts with")
  })
})
