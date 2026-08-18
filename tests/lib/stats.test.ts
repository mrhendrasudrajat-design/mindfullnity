import { describe, expect, it } from "vitest"

import type { Session } from "@/lib/templates"
import { computeStats, sortSessionsNewestFirst } from "@/lib/stats"

function makeSession(overrides: Partial<Session>): Session {
  return {
    id: "s1",
    createdAt: "2026-08-18T10:00:00.000Z",
    title: "Sesi",
    goal: "sleep",
    guide: "mentor",
    soundMix: { nature: [], instruments: [] },
    durationMin: 10,
    phases: [],
    ...overrides,
  }
}

describe("computeStats", () => {
  it("computes totals from an empty list", () => {
    expect(computeStats([])).toEqual({
      totalMinutes: 0,
      sessionCount: 0,
      activeDaysLast7: 0,
    })
  })

  it("sums minutes and counts sessions", () => {
    const sessions = [
      makeSession({ durationMin: 10 }),
      makeSession({ durationMin: 15, id: "s2" }),
    ]
    expect(computeStats(sessions).totalMinutes).toBe(25)
    expect(computeStats(sessions).sessionCount).toBe(2)
  })

  it("counts distinct active days within the last 7 days", () => {
    const now = new Date("2026-08-18T12:00:00.000Z")
    const sessions = [
      makeSession({ createdAt: "2026-08-18T08:00:00.000Z" }),
      makeSession({ id: "s2", createdAt: "2026-08-18T09:00:00.000Z" }),
      makeSession({ id: "s3", createdAt: "2026-08-15T09:00:00.000Z" }),
      makeSession({ id: "s4", createdAt: "2026-08-10T09:00:00.000Z" }),
    ]
    expect(computeStats(sessions, now).activeDaysLast7).toBe(2)
  })
})

describe("sortSessionsNewestFirst", () => {
  it("does not mutate the input", () => {
    const sessions = [makeSession({ createdAt: "2026-08-17T00:00:00.000Z" })]
    sortSessionsNewestFirst(sessions)
    expect(sessions[0].createdAt).toBe("2026-08-17T00:00:00.000Z")
  })

  it("returns the newest session first", () => {
    const sessions = [
      makeSession({ id: "old", createdAt: "2026-08-10T00:00:00.000Z" }),
      makeSession({ id: "new", createdAt: "2026-08-18T00:00:00.000Z" }),
    ]
    expect(sortSessionsNewestFirst(sessions)[0].id).toBe("new")
  })
})