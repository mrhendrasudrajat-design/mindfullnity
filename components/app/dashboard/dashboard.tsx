"use client"

import { Greeting } from "./greeting"
import { StatsCards } from "./stats-cards"
import { QuickActions } from "./quick-actions"
import { SessionArchive } from "./session-archive"
import { MoodSummaryChart } from "./mood-summary-chart"
import type { Session } from "@/lib/templates"
import type { MoodEntry } from "@/lib/supabase/moods"
import type { SessionStats } from "@/lib/stats"

export function Dashboard({
  sessions,
  moods,
  stats,
}: {
  sessions: Session[]
  moods: MoodEntry[]
  stats: SessionStats
}) {
  return (
    <div className="flex flex-col gap-6">
      <Greeting />
      <QuickActions />
      <StatsCards stats={stats} />
      <MoodSummaryChart moods={moods} />
      <SessionArchive sessions={sessions} />
    </div>
  )
}