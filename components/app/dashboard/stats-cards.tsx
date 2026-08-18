"use client"

import { Leaf, FlowerLotus, Timer } from "@phosphor-icons/react"

import { useLocale } from "@/components/providers/language-context"
import { formatDuration } from "@/lib/format"
import { getAppCopy } from "@/lib/i18n/app"
import type { SessionStats } from "@/lib/stats"

export function StatsCards({ stats }: { stats: SessionStats }) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).dashboard.stats

  const items = [
    {
      key: "minutes" as const,
      Icon: Timer,
      value: formatDuration(stats.totalMinutes, locale),
    },
    {
      key: "sessions" as const,
      Icon: FlowerLotus,
      value: String(stats.sessionCount),
    },
    {
      key: "consistency" as const,
      Icon: Leaf,
      value: `${stats.activeDaysLast7}/7`,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ key, Icon, value }) => (
        <div
          key={key}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4"
        >
          <Icon className="size-4 text-primary" aria-hidden />
          <div>
            <p className="font-heading text-lg font-semibold leading-tight">
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{copy[key]}</p>
          </div>
        </div>
      ))}
    </div>
  )
}