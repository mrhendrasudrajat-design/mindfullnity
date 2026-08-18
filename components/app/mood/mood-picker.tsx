"use client"

import {
  Smiley,
  SmileyMeh,
  SmileySad,
  SmileyWink,
  SmileyXEyes,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const LEVELS = [
  { level: 1, Icon: SmileyXEyes },
  { level: 2, Icon: SmileySad },
  { level: 3, Icon: SmileyMeh },
  { level: 4, Icon: Smiley },
  { level: 5, Icon: SmileyWink },
]

export function MoodPicker({
  labels,
  value,
  onSelect,
  size = "md",
}: {
  labels: Record<number, string>
  value?: number
  onSelect: (level: number) => void
  size?: "md" | "lg"
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={labels[value ?? 3] ?? ""}>
      {LEVELS.map(({ level, Icon }) => {
        const active = value === level
        return (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            aria-label={labels[level]}
            aria-pressed={active}
            className={cn(
              "grid place-items-center rounded-full border transition-all",
              size === "lg" ? "size-14" : "size-11",
              active
                ? "scale-110 border-primary bg-primary/15"
                : "border-border bg-card text-muted-foreground hover:bg-muted/50",
            )}
          >
            <Icon weight="fill" className={size === "lg" ? "size-6" : "size-5"} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}