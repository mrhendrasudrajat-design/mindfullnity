export type TimeOfDay = "morning" | "afternoon" | "evening" | "flexible"

export type WizardDraft = {
  step: number
  nickname?: string
  timeOfDay?: TimeOfDay
  durationMin: number
  goal?: string
  guide?: string
  nature: string[]
  instruments: string[]
  safePlace?: string
  keyword?: string
  gratitude?: string
}

export const MIN_DURATION = 5
export const MAX_DURATION = 60
export const TOTAL_STEPS = 5

export const DEFAULT_DRAFT: WizardDraft = {
  step: 0,
  durationMin: MIN_DURATION,
  nature: [],
  instruments: [],
}

export function stepCanContinue(draft: WizardDraft): boolean {
  switch (draft.step) {
    case 0:
      return true
    case 1:
      return Boolean(draft.goal)
    case 2:
      return Boolean(draft.guide)
    case 3:
      return true
    case 4:
      return true
    default:
      return true
  }
}

export function canCompose(draft: WizardDraft): boolean {
  return (
    stepCanContinue({ ...draft, step: 1 }) &&
    stepCanContinue({ ...draft, step: 2 }) &&
    draft.durationMin >= MIN_DURATION &&
    draft.durationMin <= MAX_DURATION
  )
}

export function draftResumeStep(draft: WizardDraft | null): number {
  if (!draft || draft.step <= 0 || draft.step > TOTAL_STEPS) return 0
  return draft.step
}