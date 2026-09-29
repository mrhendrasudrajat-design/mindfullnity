import type { GoalId } from "@/lib/templates"

export type ProgramSlug = "program-7" | "program-21" | "program-90"

export type Program = {
  id: string
  slug: ProgramSlug
  title: string
  durationDays: number
  priceIdr: number
  isActive: boolean
  createdAt: string
}

export type ProgramRow = {
  id: string
  slug: string
  title: string
  duration_days: number
  price_idr: number
  is_active: boolean
  created_at: string
}

export function toProgram(row: ProgramRow): Program {
  return {
    id: row.id,
    slug: row.slug as ProgramSlug,
    title: row.title,
    durationDays: row.duration_days,
    priceIdr: row.price_idr,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export type ProgramDay = {
  id: string
  programId: string
  dayNumber: number
  title: string
  goal: GoalId
  phases: unknown[]
}

export type ProgramDayRow = {
  id: string
  program_id: string
  day_number: number
  title: string
  goal: string
  phases: unknown[]
}

export function toProgramDay(row: ProgramDayRow): ProgramDay {
  return {
    id: row.id,
    programId: row.program_id,
    dayNumber: row.day_number,
    title: row.title,
    goal: row.goal as GoalId,
    phases: row.phases ?? [],
  }
}

export type Enrollment = {
  id: string
  userId: string
  programId: string
  status: "active" | "completed" | "expired"
  currentDay: number
  startedAt: string
  completedAt: string | null
}

export type EnrollmentRow = {
  id: string
  user_id: string
  program_id: string
  status: string
  current_day: number
  started_at: string
  completed_at: string | null
}

export function toEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    programId: row.program_id,
    status: row.status as Enrollment["status"],
    currentDay: row.current_day,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }
}

export type Progress = {
  id: string
  enrollmentId: string
  dayNumber: number
  sessionId: string | null
  completedAt: string | null
}

export type ProgressRow = {
  id: string
  enrollment_id: string
  day_number: number
  session_id: string | null
  completed_at: string | null
}

export function toProgress(row: ProgressRow): Progress {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    dayNumber: row.day_number,
    sessionId: row.session_id,
    completedAt: row.completed_at,
  }
}

export function isDayUnlocked(enrollment: Enrollment | null, dayNumber: number): boolean {
  if (!enrollment) return false
  if (enrollment.status === "completed") return true
  return dayNumber <= enrollment.currentDay
}

export function nextUnlockDay(progress: Progress[]): number {
  const completed = progress.filter((p) => p.completedAt).length
  return completed + 1
}
