import { describe, expect, it } from "vitest"

import { activePhaseIndex, ringProgress } from "@/lib/player"

describe("activePhaseIndex", () => {
  it("starts at the first phase", () => {
    expect(activePhaseIndex(7, 0, 700)).toBe(0)
  })

  it("moves to the next phase as time elapses", () => {
    expect(activePhaseIndex(7, 100, 700)).toBe(1)
    expect(activePhaseIndex(7, 400, 700)).toBe(4)
    expect(activePhaseIndex(7, 700, 700)).toBe(6)
  })

  it("clamps to the last phase at the end", () => {
    expect(activePhaseIndex(7, 9999, 700)).toBe(6)
  })

  it("handles degenerate inputs", () => {
    expect(activePhaseIndex(0, 10, 10)).toBe(0)
    expect(activePhaseIndex(7, 5, 0)).toBe(0)
    expect(activePhaseIndex(7, -10, 700)).toBe(0)
  })
})

describe("ringProgress", () => {
  it("is full at the start and empty at the end", () => {
    expect(ringProgress(0, 600)).toBe(1)
    expect(ringProgress(600, 600)).toBe(0)
  })

  it("is proportional in between", () => {
    expect(ringProgress(300, 600)).toBeCloseTo(0.5)
  })

  it("clamps to the 0..1 range", () => {
    expect(ringProgress(700, 600)).toBe(0)
    expect(ringProgress(-5, 600)).toBe(1)
    expect(ringProgress(10, 0)).toBe(0)
  })
})