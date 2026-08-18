"use client"

import { useEffect, useState } from "react"
import {
  CloudRain,
  MoonStars,
  MusicNotes,
  Pause,
  Play,
  TreeEvergreen,
  VinylRecord,
  Waves,
  Wind,
  type Icon,
} from "@phosphor-icons/react"
import Link from "next/link"

import { useLocale } from "@/components/providers/language-context"
import { Button, buttonVariants } from "@/components/ui/button"
import { getAppCopy } from "@/lib/i18n/app"
import {
  SOUND_CATALOG,
  type InstrumentSoundId,
  type NatureSoundId,
  type SoundId,
} from "@/lib/sound-catalog"
import { soundEngine } from "@/lib/sound-engine"
import { cn } from "@/lib/utils"

const SOUND_ICONS: Record<SoundId, Icon> = {
  rain: CloudRain,
  ocean: Waves,
  forest: TreeEvergreen,
  wind: Wind,
  night: MoonStars,
  softPads: MusicNotes,
  musicBox: VinylRecord,
}

export function SoundsPage() {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).sounds
  const [playing, setPlaying] = useState<SoundId | null>(null)
  const [volumes, setVolumes] = useState<Partial<Record<SoundId, number>>>({})

  useEffect(() => {
    return () => soundEngine.stopAll()
  }, [])

  function toggle(id: SoundId) {
    if (playing === id) {
      soundEngine.stop(id)
      setPlaying(null)
    } else {
      if (playing) soundEngine.stop(playing)
      void soundEngine.start(id)
      setPlaying(id)
    }
  }

  function changeVolume(id: SoundId, volume: number) {
    setVolumes((current) => ({ ...current, [id]: volume }))
    soundEngine.setVolume(id, volume)
  }

  const selectedIds = playing ? [playing] : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {copy.title}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOUND_CATALOG.map((sound) => {
          const Icon = SOUND_ICONS[sound.id]
          const label =
            sound.category === "nature"
              ? getAppCopy(locale).wizard.steps.sound.sounds[
                  sound.id as NatureSoundId
                ]
              : getAppCopy(locale).wizard.steps.sound.instrumentsNames[
                  sound.id as InstrumentSoundId
                ]
          const isPlaying = playing === sound.id
          const volume = volumes[sound.id] ?? sound.defaultVolume

          return (
            <div
              key={sound.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon weight="fill" className="size-5" aria-hidden />
                  </span>
                  <span className="font-heading font-medium">{label}</span>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant={isPlaying ? "default" : "outline"}
                  onClick={() => toggle(sound.id)}
                  aria-label={isPlaying ? copy.stop : copy.play}
                  aria-pressed={isPlaying}
                >
                  {isPlaying ? (
                    <Pause weight="fill" className="size-4" aria-hidden />
                  ) : (
                    <Play weight="fill" className="size-4" aria-hidden />
                  )}
                </Button>
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                {copy.volume}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(event) => changeVolume(sound.id, Number(event.target.value))}
                  className="w-full accent-primary"
                />
              </label>
            </div>
          )
        })}
      </div>

      {selectedIds.length > 0 ? (
        <Link
          href={`/app/session/new?sounds=${selectedIds.join(",")}`}
          className={cn(buttonVariants(), "w-full")}
        >
          {copy.useForSession}
        </Link>
      ) : null}
    </div>
  )
}