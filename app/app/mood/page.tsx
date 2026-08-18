import type { Metadata } from "next"

import { MoodPage } from "@/components/app/mood/mood-page"
import { listMoods } from "@/lib/supabase/moods"

export const metadata: Metadata = {
  title: "Mood Tracker",
}

export default async function MoodRoute() {
  const moods = await listMoods()

  return <MoodPage moods={moods} />
}