"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { useLocale } from "@/components/providers/language-context"
import { Button } from "@/components/ui/button"
import { getAppCopy } from "@/lib/i18n/app"
import { STORAGE_KEYS } from "@/lib/storage"
import { composeSession, type GoalId, type GuideId } from "@/lib/templates"
import { createSessionAction } from "@/lib/supabase/actions"
import { useLocalStorage } from "@/lib/use-local-storage"
import {
  canCompose,
  DEFAULT_DRAFT,
  draftResumeStep,
  stepCanContinue,
  TOTAL_STEPS,
  type WizardDraft,
} from "@/lib/wizard"
import { StepHeader } from "./wizard-ui"
import { DraftBanner } from "./draft-banner"
import { ComposeAnimation } from "./compose-animation"
import { PersonalStep } from "./steps/personal-step"
import { GoalStep } from "./steps/goal-step"
import { GuideStep } from "./steps/guide-step"
import { SoundStep } from "./steps/sound-step"
import { AnchorStep } from "./steps/anchor-step"

const STEP_KEYS = ["personal", "goal", "guide", "sound", "anchor"] as const

export function Wizard({
  initialSounds,
}: {
  initialSounds?: { nature: string[]; instruments: string[] }
}) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).wizard
  const router = useRouter()

  const [stored, setStored, resetStored] = useLocalStorage<WizardDraft | null>(
    STORAGE_KEYS.draft,
    null,
  )
  const [step, setStep] = useState(() => draftResumeStep(stored))
  const [showBanner, setShowBanner] = useState(() => draftResumeStep(stored) > 0)
  const [composing, setComposing] = useState(false)
  const [composeIndex, setComposeIndex] = useState(0)

  const seeded =
    stored ??
    (initialSounds &&
    (initialSounds.nature.length > 0 || initialSounds.instruments.length > 0)
      ? { ...DEFAULT_DRAFT, ...initialSounds }
      : null)

  const draft: WizardDraft = { ...DEFAULT_DRAFT, ...(seeded ?? {}), step }

  const goTo = (next: number) => {
    setStep(next)
    setStored({ ...draft, step: next })
  }

  const update = (patch: Partial<WizardDraft>) => {
    setStored({ ...draft, ...patch })
  }

  const startOver = useCallback(() => {
    resetStored()
    setShowBanner(false)
    setStep(0)
  }, [resetStored])

  const continueAllowed = stepCanContinue(draft)
  const canFinish = canCompose(draft)
  const isLastStep = step === TOTAL_STEPS - 1

  async function runCompose() {
    const goal = draft.goal as GoalId
    const guide = draft.guide as GuideId
    const session = composeSession({
      goal,
      guide,
      soundMix: { nature: draft.nature, instruments: draft.instruments },
      durationMin: draft.durationMin,
      locale,
      nickname: draft.nickname,
      keyword: draft.keyword,
      safePlace: draft.safePlace,
      gratitude: draft.gratitude,
    })
    const { id } = await createSessionAction({
      title: session.title,
      goal,
      guide,
      soundMix: session.soundMix,
      durationMin: session.durationMin,
      phases: session.phases,
    })
    resetStored()
    router.push(`/app/session/${id}`)
  }

  const composeRef = useRef(runCompose)
  useEffect(() => {
    composeRef.current = runCompose
  })

  useEffect(() => {
    if (!composing) return
    if (composeIndex >= copy.composeAnimation.steps.length) {
      void composeRef.current()
      return
    }
    const timer = setTimeout(() => setComposeIndex((index) => index + 1), 600)
    return () => clearTimeout(timer)
  }, [composing, composeIndex, copy])

  if (composing) {
    return <ComposeAnimation copy={copy} index={composeIndex} />
  }

  const stepCopy = copy.steps[STEP_KEYS[step]]
  const stepLabel = `${copy.stepPrefix} ${step + 1} ${copy.stepPrefix === "Step" ? "of" : "dari"} ${TOTAL_STEPS}`

  return (
    <div className="flex flex-col gap-6">
      {showBanner && step === 0 ? (
        <DraftBanner
          copy={copy}
          resumeStep={draftResumeStep(stored)}
          onResume={() => goTo(draftResumeStep(stored))}
          onStartOver={startOver}
        />
      ) : null}

      <StepHeader
        stepLabel={stepLabel}
        title={stepCopy.title}
        description={stepCopy.description}
      />

      <div className="flex flex-col gap-5">
        {step === 0 ? (
          <PersonalStep copy={copy} draft={draft} update={update} />
        ) : step === 1 ? (
          <GoalStep copy={copy} draft={draft} update={update} />
        ) : step === 2 ? (
          <GuideStep copy={copy} draft={draft} update={update} />
        ) : step === 3 ? (
          <SoundStep copy={copy} draft={draft} update={update} />
        ) : (
          <AnchorStep copy={copy} draft={draft} update={update} />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => goTo(step - 1)}
        >
          {copy.back}
        </Button>
        {isLastStep ? (
          <Button
            type="button"
            disabled={!canFinish}
            onClick={() => setComposing(true)}
          >
            {copy.compose}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!continueAllowed}
            onClick={() => goTo(step + 1)}
          >
            {copy.continue}
          </Button>
        )}
      </div>
    </div>
  )
}