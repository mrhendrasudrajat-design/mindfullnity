"use client"

import { FormField } from "@/components/auth/form-field"
import { SessionSummary } from "../session-summary"
import type { AppCopy } from "@/lib/i18n/app"
import type { WizardDraft } from "@/lib/wizard"

type Props = {
  copy: AppCopy["wizard"]
  draft: WizardDraft
  update: (patch: Partial<WizardDraft>) => void
}

export function AnchorStep({ copy, draft, update }: Props) {
  const step = copy.steps.anchor

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <FormField
          label={step.safePlace}
          inputProps={{
            id: "safe-place",
            value: draft.safePlace ?? "",
            onChange: (event) => update({ safePlace: event.target.value }),
            placeholder: step.safePlacePlaceholder,
            autoComplete: "off",
          }}
        />
        <FormField
          label={step.keyword}
          inputProps={{
            id: "keyword",
            value: draft.keyword ?? "",
            onChange: (event) => update({ keyword: event.target.value }),
            placeholder: step.keywordPlaceholder,
            autoComplete: "off",
          }}
        />
        <FormField
          label={step.gratitude}
          inputProps={{
            id: "gratitude",
            value: draft.gratitude ?? "",
            onChange: (event) => update({ gratitude: event.target.value }),
            placeholder: step.gratitudePlaceholder,
            autoComplete: "off",
          }}
        />
      </div>

      <SessionSummary copy={copy} draft={draft} />
    </div>
  )
}