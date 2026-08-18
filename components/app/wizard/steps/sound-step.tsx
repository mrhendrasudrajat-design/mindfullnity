"use client"

import { Chip } from "../wizard-ui"
import type { AppCopy } from "@/lib/i18n/app"
import { INSTRUMENT_SOUNDS, NATURE_SOUNDS } from "@/lib/sound-catalog"
import type { WizardDraft } from "@/lib/wizard"

type Props = {
  copy: AppCopy["wizard"]
  draft: WizardDraft
  update: (patch: Partial<WizardDraft>) => void
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

export function SoundStep({ copy, draft, update }: Props) {
  const step = copy.steps.sound

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{step.nature}</p>
        <div className="flex flex-wrap gap-2">
          {NATURE_SOUNDS.map((sound) => (
            <Chip
              key={sound.id}
              active={draft.nature.includes(sound.id)}
              onClick={() => update({ nature: toggle(draft.nature, sound.id) })}
            >
              {step.sounds[sound.id]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{step.instruments}</p>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENT_SOUNDS.map((sound) => (
            <Chip
              key={sound.id}
              active={draft.instruments.includes(sound.id)}
              onClick={() =>
                update({ instruments: toggle(draft.instruments, sound.id) })
              }
            >
              {step.instrumentsNames[sound.id]}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  )
}