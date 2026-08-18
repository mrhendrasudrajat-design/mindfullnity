"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Pause, Play, Stop } from "@phosphor-icons/react"

import { useLocale } from "@/components/providers/language-context"
import { Button } from "@/components/ui/button"
import { formatClock } from "@/lib/format"
import { getAppCopy } from "@/lib/i18n/app"
import { activePhaseIndex, ringProgress } from "@/lib/player"
import { soundEngine } from "@/lib/sound-engine"
import type { SoundId } from "@/lib/sound-catalog"
import type { Session } from "@/lib/templates"

export function SessionPlayer({
  session,
  onFinish,
}: {
  session: Session
  onFinish: () => void
}) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).session
  const [remaining, setRemaining] = useState(session.durationMin * 60)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  const total = session.durationMin * 60
  const elapsed = total - remaining
  const phaseIndex = activePhaseIndex(session.phases.length, elapsed, total)
  const phase = session.phases[phaseIndex]
  const progress = ringProgress(elapsed, total)

  const sounds = useMemo(
    () => [...session.soundMix.nature, ...session.soundMix.instruments],
    [session.soundMix],
  )

  useEffect(() => {
    for (const id of sounds) {
      void soundEngine.start(id as SoundId)
    }
    return () => soundEngine.stopAll()
  }, [sounds])

  useEffect(() => {
    if (pausedRef.current) return
    if (remaining <= 0) {
      soundEngine.stopAll()
      onFinish()
      return
    }
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, paused, onFinish])

  function togglePause() {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  const size = 220
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={copy.player.title}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute flex flex-col items-center gap-1">
          <span className="font-heading text-3xl font-semibold tabular-nums">
            {formatClock(remaining)}
          </span>
          <span className="text-xs text-muted-foreground">{copy.player.remaining}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {phase.title}
        </p>
        <div className="flex max-w-md flex-col gap-1.5 text-sm leading-relaxed">
          {phase.lines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={togglePause} aria-pressed={paused}>
          {paused ? (
            <Play weight="fill" className="size-5" aria-hidden />
          ) : (
            <Pause weight="fill" className="size-5" aria-hidden />
          )}
          <span>{paused ? copy.player.resume : copy.player.pause}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            soundEngine.stopAll()
            onFinish()
          }}
        >
          <Stop weight="fill" className="size-4" aria-hidden />
          {copy.player.end}
        </Button>
      </div>
    </div>
  )
}