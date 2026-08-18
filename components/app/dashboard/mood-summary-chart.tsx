"use client"

import { useLocale } from "@/components/providers/language-context"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getAppCopy } from "@/lib/i18n/app"
import type { MoodEntry } from "@/lib/supabase/moods"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "recharts"

const chartConfig = {
  mood: {
    label: "Mood",
    color: "var(--chart-3)",
  },
} satisfies import("@/components/ui/chart").ChartConfig

export function MoodSummaryChart({ moods }: { moods: MoodEntry[] }) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).dashboard.moodSummary

  const last7 = moods.slice(0, 7).reverse()
  const data = last7.map((entry) => ({
    day: entry.date.slice(5),
    mood: entry.mood,
  }))

  if (data.length === 0) {
    return (
      <section aria-labelledby="mood-summary-title" className="flex flex-col gap-3">
        <h2 id="mood-summary-title" className="font-heading text-base font-medium">
          {copy.title}
        </h2>
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="mood-summary-title" className="flex flex-col gap-3">
      <h2 id="mood-summary-title" className="font-heading text-base font-medium">
        {copy.title}
      </h2>
      <ChartContainer config={chartConfig} className="h-32 w-full">
        <BarChart accessibilityLayer data={data}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} width={20} hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="mood" fill="var(--color-mood)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </section>
  )
}