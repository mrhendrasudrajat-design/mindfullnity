"use client"

import { ShieldCheck } from "@phosphor-icons/react"

import { getLandingCopy } from "@/lib/i18n/landing"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { BreathingCircle } from "./breathing-circle"
import { useLandingLocale } from "@/components/providers/language-context"

export function Hero() {
  const { locale } = useLandingLocale()
  const copy = getLandingCopy(locale).hero

  return (
    <section className="relative overflow-hidden" id="top">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_70%)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 md:grid-cols-2 md:pt-24 lg:gap-16">
        <div className="motion-safe:animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck weight="fill" className="size-3.5" aria-hidden />
            {copy.badge}
          </span>

          <h1 className="mt-6 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            {copy.headlineStart}{" "}
            <span className="text-primary">{copy.headlineAccent}</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            {copy.subtext}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/app"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
            >
              {copy.primaryCta}
            </a>
            <a
              href="#cara-kerja"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6")}
            >
              {copy.secondaryCta}
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm md:max-w-none">
          <BreathingCircle label={copy.circleLabel} />
        </div>
      </div>
    </section>
  )
}