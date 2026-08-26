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