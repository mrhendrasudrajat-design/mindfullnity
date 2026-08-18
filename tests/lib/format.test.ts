import { describe, expect, it } from "vitest"

import {
  dateKey,
  formatClock,
  formatDate,
  formatDuration,
  formatShortDate,
  greetingForHour,
} from "@/lib/format"

describe("formatDuration", () => {
  it("formats minutes in Indonesian", () => {
    expect(formatDuration(5, "id")).toBe("5 mnt")
    expect(formatDuration(60, "id")).toBe("60 mnt")
  })

  it("formats minutes in English", () => {
    expect(formatDuration(5, "en")).toBe("5 min")
    expect(formatDuration(30, "en")).toBe("30 min")
  })

  it("rounds fractional durations", () => {
    expect(formatDuration(2.4, "id")).toBe("2 mnt")
    expect(formatDuration(2.6, "id")).toBe("3 mnt")
  })

  it("handles values below one minute", () => {
    expect(formatDuration(0, "id")).toBe("kurang dari 1 mnt")
    expect(formatDuration(0, "en")).toBe("less than 1 min")
  })
})

describe("formatClock", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatClock(0)).toBe("00:00")
    expect(formatClock(5)).toBe("00:05")
    expect(formatClock(65)).toBe("01:05")
    expect(formatClock(600)).toBe("10:00")
  })

  it("never goes below zero", () => {
    expect(formatClock(-10)).toBe("00:00")
  })
})

describe("formatDate / formatShortDate", () => {
  const date = new Date(2026, 7, 18)

  it("formats a full date in Indonesian", () => {
    expect(formatDate(date, "id")).toContain("Agustus")
    expect(formatDate(date, "id")).toContain("2026")
  })

  it("formats a full date in English", () => {
    expect(formatDate(date, "en")).toContain("August")
    expect(formatDate(date, "en")).toContain("2026")
  })

  it("formats a short date with month name", () => {
    expect(formatShortDate(date, "id")).toContain("Agu")
    expect(formatShortDate(date, "en")).toContain("Aug")
  })
})

describe("greetingForHour", () => {
  it("maps morning, afternoon, and evening hours", () => {
    expect(greetingForHour(6)).toBe("morning")
    expect(greetingForHour(11)).toBe("afternoon")
    expect(greetingForHour(15)).toBe("afternoon")
    expect(greetingForHour(20)).toBe("evening")
    expect(greetingForHour(3)).toBe("evening")
  })
})

describe("dateKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(dateKey(new Date(2026, 7, 5))).toBe("2026-08-05")
    expect(dateKey(new Date(2026, 10, 18))).toBe("2026-11-18")
  })
})
