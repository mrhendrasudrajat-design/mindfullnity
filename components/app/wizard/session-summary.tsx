"use client"

import type { AppCopy } from "@/lib/i18n/app"
import {
  type InstrumentSoundId,
  type NatureSoundId,
} from "@/lib/sound-catalog"
import type { GoalId, GuideId } from "@/lib/templates"
import type { WizardDraft } from "@/lib/wizard"

export function SessionSummary({
  copy,
  draft,
}: {
  copy: AppCopy["wizard"]
  draft: WizardDraft
}) {
  const goal = draft.goal ? copy.steps.goal.goals[draft.goal as GoalId] : null
  const guide = draft.guide ? copy.steps.guide.guides[draft.guide as GuideId] : null
  const sounds = [
    ...draft.nature.map((id) => copy.steps.sound.sounds[id as NatureSoundId]),
    ...draft.instruments.map(
      (id) => copy.steps.sound.instrumentsNames[id as InstrumentSoundId],
    ),
  ]

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {copy.composeAnimation.title}
      </p>
      <dl className="grid grid-cols-1 gap-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{copy.steps.personal.duration}</dt>
          <dd className="font-medium">
            {copy.steps.personal.durationMinutes.replace("{min}", String(draft.durationMin))}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{copy.steps.goal.title}</dt>
          <dd className="font-medium">{goal?.title ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{copy.steps.guide.title}</dt>
          <dd className="font-medium">{guide?.title ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{copy.steps.sound.title}</dt>
          <dd className="text-right font-medium">
            {sounds.length > 0 ? sounds.join(" + ") : "—"}
          </dd>
        </div>
      </dl>
    </div>
  )
}