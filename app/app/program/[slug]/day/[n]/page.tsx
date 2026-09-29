import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { toProgram, toEnrollment, isDayUnlocked, type ProgramRow, type EnrollmentRow } from "@/lib/programs"
import { DayPlayer } from "@/components/app/program/day-player"

export default async function ProgramDayPage({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params
  const dayNumber = Number(n)
  if (!dayNumber || dayNumber < 1) return notFound()
  const supabase = await createClient()
  const { data: progRaw } = await supabase.from("programs").select("*").eq("slug", slug).maybeSingle()
  if (!progRaw) return notFound()
  const program = toProgram(progRaw as ProgramRow)
  if (dayNumber > program.durationDays) return notFound()

  const { data: ent } = await supabase.from("entitlements").select("id").eq("program_id", program.id).maybeSingle()
  if (!ent) redirect(`/app/program/${slug}/checkout`)

  const { data: enrollmentRaw } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()
  const enrollment = enrollmentRaw ? toEnrollment(enrollmentRaw as EnrollmentRow) : null
  if (!enrollment || !isDayUnlocked(enrollment, dayNumber)) {
    redirect(`/app/program/${slug}`)
  }

  const { data: dayRow } = await supabase
    .from("program_days")
    .select("*")
    .eq("program_id", program.id)
    .eq("day_number", dayNumber)
    .maybeSingle()

  const { data: progress } = await supabase
    .from("program_progress")
    .select("*")
    .eq("enrollment_id", enrollment.id)
    .eq("day_number", dayNumber)
    .maybeSingle()

  return (
    <DayPlayer
      programSlug={slug}
      programTitle={program.title}
      dayNumber={dayNumber}
      enrollmentId={enrollment.id}
      dayTitle={(dayRow as { title?: string } | null)?.title ?? `Hari ${dayNumber}`}
      goal={(dayRow as { goal?: string } | null)?.goal ?? "relax"}
      sessionId={(progress as { session_id?: string } | null)?.session_id ?? null}
    />
  )
}
