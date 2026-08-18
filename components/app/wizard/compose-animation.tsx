"use client"

import type { AppCopy } from "@/lib/i18n/app"
import { cn } from "@/lib/utils"

export function ComposeAnimation({
  copy,
  index,
}: {
  copy: AppCopy["wizard"]
  index: number
}) {
  return (
    <div className="flex flex-col items-center gap-8 py-10 text-center">
      <div className="relative grid size-24 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <span className="relative grid size-16 place-items-center rounded-full bg-primary/10">
          <span className="size-4 rounded-full border-2 border-primary" />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold">{copy.composeAnimation.title}</h2>
        <ol className="flex flex-col gap-1.5">
          {copy.composeAnimation.steps.map((label, stepIndex) => (
            <li
              key={label}
              className={cn(
                "text-sm transition-colors",
                stepIndex <= index ? "text-foreground" : "text-muted-foreground/50",
              )}
            >
              {label}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}