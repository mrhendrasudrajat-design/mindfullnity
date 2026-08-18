"use server"

import { revalidatePath } from "next/cache"

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

export async function saveCheckinAction(id: string, data: CheckinData) {
  await updateSessionCheckin(id, data)
  revalidatePath("/app")
  revalidatePath(`/app/session/${id}`)
}

export async function saveMoodAction(input: UpsertMoodInput) {
  const entry = await upsertMood(input)
  revalidatePath("/app")
  revalidatePath("/app/mood")
  return { entry }
}