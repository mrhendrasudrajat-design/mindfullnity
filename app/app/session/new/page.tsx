import type { Metadata } from "next"

import { Wizard } from "@/components/app/wizard/wizard"
import { SOUND_CATALOG, type SoundId } from "@/lib/sound-catalog"

export const metadata: Metadata = {
  title: "Buat sesi baru",
}

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ sounds?: string }>
}) {
  const { sounds } = await searchParams
  const ids = (sounds ?? "").split(",") as SoundId[]
  const initialSounds = sounds
    ? {
        nature: ids.filter(
          (id) => SOUND_CATALOG.some((sound) => sound.id === id && sound.category === "nature"),
        ),
        instruments: ids.filter(
          (id) =>
            SOUND_CATALOG.some((sound) => sound.id === id && sound.category === "instruments"),
        ),
      }
    : undefined

  return <Wizard initialSounds={initialSounds} />
}