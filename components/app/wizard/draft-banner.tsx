"use client"

import { ArrowClockwise } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import type { AppCopy } from "@/lib/i18n/app"

export function DraftBanner({
  copy,
  resumeStep,
  onResume,
  onStartOver,
}: {
  copy: AppCopy["wizard"]
  resumeStep: number
  onResume: () => void
  onStartOver: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm">{copy.draftBanner.resume}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onResume}>
          {copy.draftBanner.resumeCta.replace("{n}", String(resumeStep))}
        </Button>
        <Button size="sm" variant="ghost" onClick={onStartOver}>
          <ArrowClockwise className="size-4" aria-hidden />
          {copy.draftBanner.startOver}
        </Button>
      </div>
    </div>
  )
}