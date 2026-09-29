"use server"

import { revalidatePath } from "next/cache"

import { dateKey } from "@/lib/format"
import { getAppCopy } from "@/lib/i18n/app"
import type { Locale } from "@/lib/i18n/locale"
import { generateScript } from "@/lib/ai-script"
import type { GoalId, GuideId, SoundMix } from "@/lib/templates"

import {
  insertSession,
  updateSessionCheckin,
  type CheckinData,
  type NewSession,
} from "./sessions"
import { upsertMood, type UpsertMoodInput } from "./moods"
import { createDokuCheckout } from "@/lib/payments/doku"
import { createClient } from "./server"

export async function createSessionAction(input: NewSession) {
  const session = await insertSession(input)
  revalidatePath("/app")
  return { id: session.id }
}

export type GenerateSessionInput = {
  goal: GoalId
  guide: GuideId
  soundMix: SoundMix
  durationMin: number
  locale: Locale
  nickname?: string
  keyword?: string
  safePlace?: string
  gratitude?: string
}

export async function generateSessionAction(input: GenerateSessionInput) {
  const phases = await generateScript(input)
  const copy = getAppCopy(input.locale)
  const goalLabel = copy.wizard.steps.goal.goals[input.goal].title
  const unit = input.locale === "id" ? "mnt" : "min"
  const session = await insertSession({
    title: `${goalLabel} · ${input.durationMin} ${unit}`,
    goal: input.goal,
    guide: input.guide,
    soundMix: input.soundMix,
    durationMin: input.durationMin,
    phases,
  })
  revalidatePath("/app")
  return { id: session.id }
}

export async function saveCheckinAction(id: string, data: CheckinData) {
  await updateSessionCheckin(id, data)
  if (data.moodAfter) {
    await upsertMood({
      date: dateKey(new Date()),
      mood: data.moodAfter,
      note: data.reflection,
      source: "checkin",
      sessionId: id,
    })
  }
  revalidatePath("/app")
  revalidatePath(`/app/session/${id}`)
}

export async function saveMoodAction(input: UpsertMoodInput) {
  const entry = await upsertMood(input)
  revalidatePath("/app")
  revalidatePath("/app/mood")
  return { entry }
}

export async function createCheckoutAction(programSlug: string, locale: Locale) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("Harus login")
  const result = await createDokuCheckout({
    programSlug,
    locale,
    userId: user.id,
    userEmail: user.email,
  })
  revalidatePath("/app/program")
  return result
}

export async function completeProgramDayAction(enrollmentId: string, dayNumber: number, sessionId: string) {
  const supabase = await createClient()
  const { error: progErr } = await supabase
    .from("program_progress")
    .upsert(
      { enrollment_id: enrollmentId, day_number: dayNumber, session_id: sessionId, completed_at: new Date().toISOString() },
      { onConflict: "enrollment_id,day_number" },
    )
  if (progErr) throw new Error(progErr.message)
  // Advance current_day jika day yang selesai == current_day
  const { data: enroll } = await supabase
    .from("program_enrollments")
    .select("current_day, program_id, status")
    .eq("id", enrollmentId)
    .maybeSingle()
  if (enroll && (enroll as { current_day: number; status: string }).current_day === dayNumber) {
    const next = dayNumber + 1
    // cek durasi program
    const { data: prog } = await supabase
      .from("programs")
      .select("duration_days")
      .eq("id", (enroll as { program_id: string }).program_id)
      .maybeSingle()
    const duration = (prog as { duration_days: number } | null)?.duration_days ?? 90
    if (next > duration) {
      await supabase.from("program_enrollments").update({ status: "completed", completed_at: new Date().toISOString(), current_day: duration }).eq("id", enrollmentId)
    } else {
      await supabase.from("program_enrollments").update({ current_day: next }).eq("id", enrollmentId)
    }
  }
  revalidatePath("/app/program")
}