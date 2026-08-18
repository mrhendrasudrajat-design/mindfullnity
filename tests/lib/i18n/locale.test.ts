import { describe, expect, it } from "vitest"

import {
  getInitialLocale,
  isLocale,
  languageCode,
  localeLabel,
} from "@/lib/i18n/locale"

describe("isLocale", () => {
  it("accepts only 'id' and 'en'", () => {
    expect(isLocale("id")).toBe(true)
    expect(isLocale("en")).toBe(true)
    expect(isLocale("fr")).toBe(false)
    expect(isLocale("")).toBe(false)
    expect(isLocale(null)).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })
})

describe("getInitialLocale", () => {
  it("falls back to 'id' by default", () => {
    expect(getInitialLocale(null)).toBe("id")
    expect(getInitialLocale(undefined)).toBe("id")
  })

  it("keeps a valid stored locale", () => {
    expect(getInitialLocale("en")).toBe("en")
    expect(getInitialLocale("id")).toBe("id")
  })

  it("ignores invalid stored values", () => {
    expect(getInitialLocale("de")).toBe("id")
  })

  it("respects an explicit fallback", () => {
    expect(getInitialLocale(null, "en")).toBe("en")
  })
})

describe("localeLabel", () => {
  it("maps each locale to its display name", () => {
    expect(localeLabel("id")).toBe("Indonesia")
    expect(localeLabel("en")).toBe("English")
  })
})

describe("languageCode", () => {
  it("maps each locale to an Intl-compatible code", () => {
    expect(languageCode("id")).toBe("id")
    expect(languageCode("en")).toBe("en-US")
  })
})
