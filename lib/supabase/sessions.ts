import type { Phase, Session, SoundMix } from "@/lib/templates"

import { createClient } from "./server"

type SessionRow = {
  id: string
  title: string
  goal: Session["goal"]
  guide: Session["guide"]
  sound_mix: SoundMix
  duration_min: number
  phases: Phase[]
  mood_before: number | null
  mood_after: number | null
  reflection: string | null
  integration_action: string | null
  created_at: string
}

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    goal: row.goal,
    guide: row.guide,
    soundMix: row.sound_mix,
    durationMin: row.duration_min,
    phases: row.phases,
    moodBefore: row.mood_before ?? undefined,
    moodAfter: row.mood_after ?? undefined,
    reflection: row.reflection ?? undefined,
    integrationAction: row.integration_action ?? undefined,
  }
}

export type NewSession = {
  title: string
  goal: Session["goal"]
  guide: Session["guide"]
  soundMix: SoundMix
  durationMin: number
  phases: Phase[]
  moodBefore?: number
}

export type CheckinData = {
  moodBefore?: number
  moodAfter?: number
  reflection?: string
  integrationAction?: string
}

export async function listSessions(): Promise<Session[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as SessionRow[] | null ?? []).map(toSession)
}

export async function getSession(id: string): Promise<Session | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? toSession(data as SessionRow) : null
}

export async function insertSession(input: NewSession): Promise<Session> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      title: input.title,
      goal: input.goal,
      guide: input.guide,
      sound_mix: input.soundMix,
      duration_min: input.durationMin,
      phases: input.phases,
      mood_before: input.moodBefore ?? null,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return toSession(data as SessionRow)
}

export async function updateSessionCheckin(
  id: string,
  data: CheckinData,
): Promise<Session> {
  const supabase = await createClient()
  const { data: updated, error } = await supabase
    .from("sessions")
    .update({
      mood_before: data.moodBefore ?? null,
      mood_after: data.moodAfter ?? null,
      reflection: data.reflection ?? null,
      integration_action: data.integrationAction ?? null,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return toSession(updated as SessionRow)
}