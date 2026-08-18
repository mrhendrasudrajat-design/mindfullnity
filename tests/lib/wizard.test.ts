import { describe, expect, it } from "vitest"

import {
  canCompose,
  DEFAULT_DRAFT,
  draftResumeStep,
  MAX_DURATION,
  MIN_DURATION,
  stepCanContinue,
  TOTAL_STEPS,
  type WizardDraft,
} from "@/lib/wizard"

describe("stepCanContinue", () => {
  it("always allows the first step to continue", () => {
    expect(stepCanContinue({ ...DEFAULT_DRAFT, step: 0 })).toBe(true)
  })

  it("requires a goal on step 2", () => {
    expect(stepCanContinue({ ...DEFAULT_DRAFT, step: 1, goal: undefined })).toBe(false)
    expect(stepCanContinue({ ...DEFAULT_DRAFT, step: 1, goal: "sleep" })).toBe(true)
  })

  it("requires a guide on step 3", () => {
    expect(stepCanContinue({ ...DEFAULT_DRAFT, step: 2, guide: undefined })).toBe(false)
    expect(stepCanContinue({ ...DEFAULT_DRAFT, step: 2, guide: "mentor" })).toBe(true)
  })

  it("allows sound and anchor steps without selection", () => {
    expect(stepCanContinue({ ...DEFAULT_DRAFT, step: 3 })).toBe(true)
    expect(stepCanContinue({ ...DEFAULT_DRAFT, step: 4 })).toBe(true)
  })
})

describe("canCompose", () => {
  it("requires goal, guide and a valid duration", () => {
    const base: WizardDraft = { ...DEFAULT_DRAFT, goal: "sleep", guide: "mentor" }
    expect(canCompose(base)).toBe(true)
    expect(canCompose({ ...base, goal: undefined })).toBe(false)
    expect(canCompose({ ...base, guide: undefined })).toBe(false)
    expect(canCompose({ ...base, durationMin: MIN_DURATION - 1 })).toBe(false)
    expect(canCompose({ ...base, durationMin: MAX_DURATION + 1 })).toBe(false)
  })
})

describe("draftResumeStep", () => {
  it("returns 0 for null or invalid drafts", () => {
    expect(draftResumeStep(null)).toBe(0)
    expect(draftResumeStep({ ...DEFAULT_DRAFT, step: 0 })).toBe(0)
    expect(draftResumeStep({ ...DEFAULT_DRAFT, step: TOTAL_STEPS + 1 })).toBe(0)
  })

  it("returns the saved step for a valid draft", () => {
    expect(draftResumeStep({ ...DEFAULT_DRAFT, step: 3 })).toBe(3)
  })
})