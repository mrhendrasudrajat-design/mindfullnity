"use client"

import type { AppCopy } from "@/lib/i18n/app"
import { GUIDE_IDS, type GuideId } from "@/lib/templates"
import type { WizardDraft } from "@/lib/wizard"
import { cn } from "@/lib/utils"

type Props = {
  copy: AppCopy["wizard"]
  draft: WizardDraft
  update: (patch: Partial<WizardDraft>) => void
}

export function GuideStep({ copy, draft, update }: Props) {
  const step = copy.steps.guide

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {GUIDE_IDS.map((guide) => {
        const item = step.guides[guide as GuideId]
        const active = draft.guide === guide
        return (
          <button
            key={guide}
            type="button"
            onClick={() => update({ guide })}
            aria-pressed={active}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors",
              active
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-muted/50",
            )}
          >
            <span className="font-heading font-medium">{item.title}</span>
            <span className="text-xs text-muted-foreground">{item.description}</span>
          </button>
        )
      })}
    </div>
  )
}