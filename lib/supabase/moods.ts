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
  const { data, error } = await supabase
    .from("mood_entries")
    .upsert(
      {
        date: input.date,
        mood: input.mood,
        note: input.note ?? null,
        source: input.source ?? "manual",
      },
      { onConflict: "user_id,date" },
    )
    .select("date, mood, note, source")
    .single()

  if (error) throw new Error(error.message)
  return toMoodEntry(data as MoodRow)
}