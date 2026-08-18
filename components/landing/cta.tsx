"use client"

import { getLandingCopy } from "@/lib/i18n/landing"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useLandingLocale } from "@/components/providers/language-context"
import { Reveal } from "./reveal"

export function Cta() {
  const { locale } = useLandingLocale()
  const copy = getLandingCopy(locale).cta

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-12 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full border border-primary-foreground/20 motion-safe:animate-breath"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 right-10 h-72 w-72 rounded-full border border-primary-foreground/10"
          />

          <div className="relative">
            <h2 className="mx-auto max-w-xl font-heading text-3xl font-semibold leading-tight tracking-tight text-primary-foreground md:text-4xl">
              {copy.title}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-primary-foreground/80">
              {copy.subtext}
            </p>
            <a
              href="/app"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-9 h-12 bg-primary-foreground px-7 text-primary hover:bg-primary-foreground/90",
              )}
            >
              {copy.button}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}