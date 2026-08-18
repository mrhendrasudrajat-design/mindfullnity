"use client"

import { Clock, MoonStars, Plant } from "@phosphor-icons/react"
import type { ReactNode } from "react"

import { getLandingCopy } from "@/lib/i18n/landing"

import { useLandingLocale } from "@/components/providers/language-context"
import { Reveal } from "./reveal"

type UseCaseItem = (ReturnType<typeof getLandingCopy>["useCases"]["items"])[number]

const ICONS: Record<number, ReactNode> = {
  0: <Plant weight="fill" className="size-5" aria-hidden />,
  1: <Clock weight="fill" className="size-5" aria-hidden />,
  2: <MoonStars weight="fill" className="size-5" aria-hidden />,
}

export function UseCases() {
  const { locale } = useLandingLocale()
  const copy = getLandingCopy(locale).useCases

  return (
    <section
      id="skenario"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 md:py-28"
    >
      <Reveal>
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{copy.lead}</p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {copy.items.map((item: UseCaseItem, index: number) => (
          <Reveal key={item.title} className="h-full" delay={index * 100}>
            <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/25">
              <span className="grid size-11 place-items-center rounded-2xl border border-primary/15 bg-primary/5 text-primary">
                {ICONS[index]}
              </span>
              <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
