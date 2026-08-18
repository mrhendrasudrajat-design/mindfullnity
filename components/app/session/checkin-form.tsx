"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { FormField } from "@/components/auth/form-field"
import { MoodPicker } from "@/components/app/mood/mood-picker"
import { useLocale } from "@/components/providers/language-context"
import { Button } from "@/components/ui/button"
import { dateKey } from "@/lib/format"
import { getAppCopy } from "@/lib/i18n/app"
import { saveCheckinAction, saveMoodAction } from "@/lib/supabase/actions"

export function CheckinForm({
  sessionId,
  moodBefore,
  onDone,
}: {
  sessionId: string
  moodBefore?: number
  onDone: () => void
}) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).checkin
  const router = useRouter()

  const [moodAfter, setMoodAfter] = useState<number | undefined>(undefined)
  const [reflection, setReflection] = useState("")
  const [integrationAction, setIntegrationAction] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await saveCheckinAction(sessionId, {
      moodBefore,
      moodAfter,
      reflection: reflection.trim() || undefined,
      integrationAction: integrationAction.trim() || undefined,
    })
    if (moodAfter) {
      await saveMoodAction({
        date: dateKey(new Date()),
        mood: moodAfter,
        note: reflection.trim() || undefined,
        source: "checkin",
      })
    }
    router.refresh()
    onDone()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{copy.moodAfter}</p>
        <MoodPicker labels={getAppCopy(locale).mood.levels} value={moodAfter} onSelect={setMoodAfter} />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{copy.reflection}</span>
        <textarea
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          placeholder={copy.reflectionPlaceholder}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40"
        />
      </label>

      <FormField
        label={copy.integrationAction}
        inputProps={{
          id: "integration-action",
          value: integrationAction,
          onChange: (event) => setIntegrationAction(event.target.value),
          placeholder: copy.integrationPlaceholder,
        }}
      />

      <Button type="button" size="lg" className="w-full" disabled={saving} onClick={handleSave}>
        {copy.save}
      </Button>
    </div>
  )
}