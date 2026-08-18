"use client"

import { useState } from "react"

import { useLocale } from "@/components/providers/language-context"
import { Button } from "@/components/ui/button"
import { MoodPicker } from "@/components/app/mood/mood-picker"
import { getAppCopy } from "@/lib/i18n/app"
import {
  type InstrumentSoundId,
  type NatureSoundId,
} from "@/lib/sound-catalog"
import type { GoalId, GuideId, Session } from "@/lib/templates"

export function SessionReady({
  session,
  onStart,
}: {
  session: Session
  onStart: (moodBefore: number | undefined) => void
}) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale)
  const ready = copy.session.ready
  const [moodBefore, setMoodBefore] = useState<number | undefined>(undefined)

  const goal = copy.wizard.steps.goal.goals[session.goal as GoalId]
  const guide = copy.wizard.steps.guide.guides[session.guide as GuideId]
  const sounds = [
    ...session.soundMix.nature.map(
      (id) => copy.wizard.steps.sound.sounds[id as NatureSoundId],
    ),
    ...session.soundMix.instruments.map(
      (id) => copy.wizard.steps.sound.instrumentsNames[id as InstrumentSoundId],
    ),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {ready.title}
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {session.title}
        </h1>
      </div>

      <dl className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{ready.goal}</dt>
          <dd className="font-medium">{goal?.title ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{ready.guide}</dt>
          <dd className="font-medium">{guide?.title ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{ready.duration}</dt>
          <dd className="font-medium">
            {copy.wizard.steps.personal.durationMinutes.replace(
              "{min}",
              String(session.durationMin),
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{ready.sound}</dt>
          <dd className="text-right font-medium">
            {sounds.length > 0 ? sounds.join(" + ") : "—"}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{copy.checkin.moodBefore}</p>
        <MoodPicker
          labels={copy.mood.levels}
          value={moodBefore}
          onSelect={setMoodBefore}
        />
      </div>

      <Button type="button" size="lg" className="w-full" onClick={() => onStart(moodBefore)}>
        {ready.start}
      </Button>
    </div>
  )
}