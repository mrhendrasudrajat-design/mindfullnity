import { createClient } from "./server"

export type MoodEntry = {
  date: string
  mood: number
  note?: string
  source: "manual" | "checkin"
}

type MoodRow = {
  date: string
  mood: number
  note: string | null
  source: "manual" | "checkin"
}

function toMoodEntry(row: MoodRow): MoodEntry {
  return {
    date: row.date,
    mood: row.mood,
    note: row.note ?? undefined,
    source: row.source,
  }
}

export type UpsertMoodInput = {
  date: string
  mood: number
  note?: string
  source?: "manual" | "checkin"
  sessionId?: string
}

export async function listMoods(): Promise<MoodEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("mood_entries")
    .select("date, mood, note, source")
    .order("date", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as MoodRow[] | null ?? []).map(toMoodEntry)
}

export async function upsertMood(input: UpsertMoodInput): Promise<MoodEntry> {
  const supabase = await createClient()

  if (input.source === "checkin" && input.sessionId) {
    const { data, error } = await supabase
      .from("mood_entries")
      .upsert(
        {
          date: input.date,
          mood: input.mood,
          note: input.note ?? null,
          source: "checkin",
          session_id: input.sessionId,
        },
        { onConflict: "user_id,session_id" },
      )
      .select("date, mood, note, source")
      .single()

    if (error) throw new Error(error.message)
    return toMoodEntry(data as MoodRow)
  }

  const { data: existing, error: findError } = await supabase
    .from("mood_entries")
    .select("id")
    .eq("date", input.date)
    .eq("source", "manual")
    .maybeSingle()

  if (findError) throw new Error(findError.message)

  const row = {
    date: input.date,
    mood: input.mood,
    note: input.note ?? null,
    source: input.source ?? "manual",
    session_id: null,
  }

  const { data, error } = existing
    ? await supabase
        .from("mood_entries")
        .update(row)
        .eq("id", existing.id)
        .select("date, mood, note, source")
        .single()
    : await supabase
        .from("mood_entries")
        .insert(row)
        .select("date, mood, note, source")
        .single()

  if (error) throw new Error(error.message)
  return toMoodEntry(data as MoodRow)
}