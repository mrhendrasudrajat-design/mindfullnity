import type { Metadata } from "next"

import { Dashboard } from "@/components/app/dashboard/dashboard"
import { listMoods } from "@/lib/supabase/moods"
import { listSessions } from "@/lib/supabase/sessions"
import { computeStats } from "@/lib/stats"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const [sessions, moods] = await Promise.all([listSessions(), listMoods()])
  const stats = computeStats(sessions)

  return <Dashboard sessions={sessions} moods={moods} stats={stats} />
}