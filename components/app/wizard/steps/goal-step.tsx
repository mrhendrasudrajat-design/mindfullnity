"use client"

import type { AppCopy } from "@/lib/i18n/app"
import { GOAL_IDS, type GoalId } from "@/lib/templates"
import type { WizardDraft } from "@/lib/wizard"
import { cn } from "@/lib/utils"

type Props = {
  copy: AppCopy["wizard"]
  draft: WizardDraft
  update: (patch: Partial<WizardDraft>) => void
}

export function GoalStep({ copy, draft, update }: Props) {
  const step = copy.steps.goal

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {GOAL_IDS.map((goal) => {
        const item = step.goals[goal as GoalId]
        const active = draft.goal === goal
        return (
          <button
            key={goal}
            type="button"
            onClick={() => update({ goal })}
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