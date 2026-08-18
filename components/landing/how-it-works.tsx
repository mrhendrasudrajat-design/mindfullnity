"use client"

import { getLandingCopy } from "@/lib/landing-i18n"

import { useLandingLocale } from "./locale-context"
import { Reveal } from "./reveal"

export function HowItWorks() {
  const { locale } = useLandingLocale()
  const copy = getLandingCopy(locale).howItWorks

  return (
    <section
      id="cara-kerja"
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

      <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {copy.steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 100}>
            <div className="relative">
              <div className="flex items-center gap-4">
                <span className="font-heading text-5xl font-semibold leading-none text-primary/25 md:text-6xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index < copy.steps.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden h-px flex-1 border-t border-dashed border-border md:block"
                  />
                )}
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}