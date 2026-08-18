"use client"

import { FormField } from "@/components/auth/form-field"
import { Chip } from "../wizard-ui"
import type { AppCopy } from "@/lib/i18n/app"
import { MAX_DURATION, MIN_DURATION, type TimeOfDay, type WizardDraft } from "@/lib/wizard"

type Props = {
  copy: AppCopy["wizard"]
  draft: WizardDraft
  update: (patch: Partial<WizardDraft>) => void
}

const TIME_OF_DAYS: TimeOfDay[] = ["morning", "afternoon", "evening", "flexible"]

export function PersonalStep({ copy, draft, update }: Props) {
  const step = copy.steps.personal
  const durationLabel = step.durationMinutes.replace("{min}", String(draft.durationMin))

  return (
    <div className="flex flex-col gap-5">
      <FormField
        label={step.nickname}
        inputProps={{
          id: "nickname",
          value: draft.nickname ?? "",
          onChange: (event) => update({ nickname: event.target.value }),
          placeholder: step.nicknamePlaceholder,
          autoComplete: "off",
        }}
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{step.timeOfDay}</p>
        <div className="flex flex-wrap gap-2">
          {TIME_OF_DAYS.map((value) => (
            <Chip
              key={value}
              active={draft.timeOfDay === value}
              onClick={() => update({ timeOfDay: value })}
            >
              {step.timeOfDayOptions[value]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="duration" className="text-sm font-medium">
            {step.duration}
          </label>
          <span className="text-sm font-semibold text-primary">{durationLabel}</span>
        </div>
        <input
          id="duration"
          type="range"
          min={MIN_DURATION}
          max={MAX_DURATION}
          step={1}
          value={draft.durationMin}
          onChange={(event) => update({ durationMin: Number(event.target.value) })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{step.durationMinutes.replace("{min}", String(MIN_DURATION))}</span>
          <span>{step.durationMinutes.replace("{min}", String(MAX_DURATION))}</span>
        </div>
      </div>
    </div>
  )
}