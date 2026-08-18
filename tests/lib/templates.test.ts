import { describe, expect, it } from "vitest"

import type { Locale } from "@/lib/i18n/locale"
import {
  buildPhases,
  composeSession,
  GOAL_IDS,
  GUIDE_IDS,
  PHASE_IDS,
  type GoalId,
} from "@/lib/templates"

const LOCALES: Locale[] = ["id", "en"]

const anchorValues = {
  id: { nickname: "Alya", keyword: "damai", safePlace: "kamar sore hari", gratitude: "teh hangat" },
  en: { nickname: "Alya", keyword: "peace", safePlace: "my room in the evening", gratitude: "warm tea" },
}

describe("buildPhases", () => {
  it("builds exactly seven phases in canonical order", () => {
    for (const locale of LOCALES) {
      for (const goal of GOAL_IDS) {
        const phases = buildPhases(goal, locale, anchorValues[locale])
        expect(phases.map((phase) => phase.id)).toEqual(PHASE_IDS)
      }
    }
  })

  it("produces non-empty lines without leftover placeholders", () => {
    for (const locale of LOCALES) {
      for (const goal of GOAL_IDS) {
        const phases = buildPhases(goal, locale, anchorValues[locale])
        for (const phase of phases) {
          expect(phase.title.trim().length).toBeGreaterThan(0)
          expect(phase.lines.length).toBeGreaterThan(0)
          for (const line of phase.lines) {
            expect(line.trim().length).toBeGreaterThan(0)
            expect(line).not.toMatch(/\{\w+\}/)
          }
        }
      }
    }
  })

  it("has goal-specific release and anchor content", () => {
    const sleep = buildPhases("sleep", "id", anchorValues.id)
    const focus = buildPhases("focus", "id", anchorValues.id)
    const releaseSleep = sleep.find((p) => p.id === "release")?.lines.join(" ") ?? ""
    const releaseFocus = focus.find((p) => p.id === "release")?.lines.join(" ") ?? ""
    expect(releaseSleep).not.toBe(releaseFocus)
  })

  it("injects anchor values into lines", () => {
    const phases = buildPhases("relax", "id", anchorValues.id)
    const allLines = phases.flatMap((phase) => phase.lines).join(" ")
    expect(allLines).toContain("kamar sore hari")
    expect(allLines).toContain("teh hangat")
  })
})

describe("composeSession", () => {
  it("builds a valid session from the input", () => {
    const session = composeSession({
      goal: "sleep",
      guide: "mentor",
      soundMix: { nature: ["rain"], instruments: [] },
      durationMin: 10,
      locale: "id",
      nickname: "Alya",
      keyword: "damai",
    })

    expect(session.id.length).toBeGreaterThan(0)
    expect(new Date(session.createdAt).toString()).not.toBe("Invalid Date")
    expect(session.title).toContain("Tidur")
    expect(session.title).toContain("10 mnt")
    expect(session.goal).toBe("sleep")
    expect(session.guide).toBe("mentor")
    expect(session.durationMin).toBe(10)
    expect(session.phases).toHaveLength(7)
    expect(session.moodBefore).toBeUndefined()
    expect(session.moodAfter).toBeUndefined()
  })

  it("prepends the guide introduction to the first phase", () => {
    const session = composeSession({
      goal: "stress",
      guide: "friend",
      soundMix: { nature: [], instruments: [] },
      durationMin: 5,
      locale: "en",
      nickname: "Alya",
    })
    const firstLine = session.phases[0].lines[0]
    expect(firstLine).toContain("Alya")
    expect(session.phases[0].lines.length).toBeGreaterThan(3)
  })

  it("uses default anchors when optional values are empty", () => {
    const session = composeSession({
      goal: "relax",
      guide: "mentor",
      soundMix: { nature: [], instruments: [] },
      durationMin: 5,
      locale: "id",
    })
    const allLines = session.phases.flatMap((phase) => phase.lines).join(" ")
    expect(allLines).toContain("tenang")
    expect(allLines).toContain("tempat amanmu")
  })

  it("does not mutate the input sound mix", () => {
    const soundMix = { nature: ["ocean"], instruments: ["softPads"] }
    const session = composeSession({
      goal: "energy",
      guide: "futureSelf",
      soundMix,
      durationMin: 8,
      locale: "en",
    })
    expect(session.soundMix).toEqual(soundMix)
    expect(session.soundMix).not.toBe(soundMix)
    expect(soundMix.nature).toEqual(["ocean"])
  })

  it("works for every goal and guide combination", () => {
    for (const locale of LOCALES) {
      for (const goal of GOAL_IDS) {
        for (const guide of GUIDE_IDS) {
          const session = composeSession({
            goal: goal as GoalId,
            guide,
            soundMix: { nature: ["rain"], instruments: ["musicBox"] },
            durationMin: 15,
            locale,
          })
          expect(session.phases).toHaveLength(7)
          expect(session.phases.every((phase) => phase.lines.length > 0)).toBe(true)
        }
      }
    }
  })
})
