"use client"

import { Quotes, Star } from "@phosphor-icons/react"

import { getLandingCopy } from "@/lib/landing-i18n"

import { useLandingLocale } from "./locale-context"
import { Reveal } from "./reveal"

type TestimonialItem =
  (ReturnType<typeof getLandingCopy>["testimonials"]["items"])[number]

export function Testimonials() {
  const { locale } = useLandingLocale()
  const copy = getLandingCopy(locale).testimonials

  return (
    <section
      id="testimoni"
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
        {copy.items.map((item: TestimonialItem, index: number) => (
          <Reveal key={item.name} className="h-full" delay={index * 100}>
            <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-8">
              <Quotes className="size-6 text-primary/40" weight="fill" aria-hidden />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                “{item.quote}”
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {item.name.charAt(0)}
                </span>
                <figcaption>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </figcaption>
                <span
                  className="ml-auto inline-flex items-center gap-1 text-primary"
                  aria-label="5 / 5"
                >
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="size-3.5" weight="fill" aria-hidden />
                  ))}
                </span>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}