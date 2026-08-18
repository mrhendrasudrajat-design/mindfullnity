import { dateKey } from "@/lib/format"
import type { Session } from "@/lib/templates"

export type SessionStats = {
  totalMinutes: number
  sessionCount: number
  activeDaysLast7: number
}

export function computeStats(
  sessions: Session[],
  now: Date = new Date(),
): SessionStats {
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.durationMin,
    0,
  )
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000
  const activeDays = new Set(
    sessions
      .filter((session) => new Date(session.createdAt).getTime() >= sevenDaysAgo)
      .map((session) => dateKey(new Date(session.createdAt))),
  )
  return {
    totalMinutes,
    sessionCount: sessions.length,
    activeDaysLast7: activeDays.size,
  }
}

export function sortSessionsNewestFirst(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
