"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { MoodPicker } from "@/components/app/mood/mood-picker"
import { useLocale } from "@/components/providers/language-context"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { dateKey } from "@/lib/format"
import { getAppCopy } from "@/lib/i18n/app"
import { saveMoodAction } from "@/lib/supabase/actions"
import type { MoodEntry } from "@/lib/supabase/moods"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

const chartConfig = {
  mood: {
    label: "Mood",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function MoodPage({ moods }: { moods: MoodEntry[] }) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).mood
  const router = useRouter()

  const today = dateKey(new Date())
  const todayEntry = moods.find((entry) => entry.date === today)
  const [selected, setSelected] = useState<number | undefined>(todayEntry?.mood)
  const [note, setNote] = useState(todayEntry?.note ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const chartData = moods
    .slice(0, 30)
    .reverse()
    .map((entry) => ({ day: entry.date.slice(5), mood: entry.mood }))

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    await saveMoodAction({
      date: today,
      mood: selected,
      note: note.trim() || undefined,
      source: "manual",
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.today}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <MoodPicker labels={copy.levels} value={selected} onSelect={setSelected} size="lg" />
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={copy.notePlaceholder}
          rows={2}
          aria-label={copy.note}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40"
        />
        <Button
          type="button"
          disabled={!selected || saving}
          onClick={handleSave}
          className="w-full"
        >
          {saved ? copy.saved : copy.save}
        </Button>
      </div>

      <section aria-labelledby="chart-title" className="flex flex-col gap-3">
        <h2 id="chart-title" className="font-heading text-base font-medium">
          {copy.chartTitle}
        </h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-44 w-full">
            <BarChart accessibilityLayer data={chartData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} width={20} hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="mood" fill="var(--color-mood)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </section>
    </div>
  )
}