"use client"

import { Plus } from "@phosphor-icons/react"
import { Accordion } from "@base-ui/react"

import { getLandingCopy } from "@/lib/landing-i18n"

import { useLandingLocale } from "./locale-context"
import { Reveal } from "./reveal"

type FaqItem = (ReturnType<typeof getLandingCopy>["faq"]["items"])[number]

export function Faq() {
  const { locale } = useLandingLocale()
  const copy = getLandingCopy(locale).faq

  return (
    <section
      id="faq"
      className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 sm:px-6 md:py-28"
    >
      <Reveal>
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{copy.lead}</p>
        </div>
      </Reveal>

      <Reveal delay={100} className="mt-12">
        <Accordion.Root defaultValue={["0"]} className="space-y-3">
          {copy.items.map((item: FaqItem, index: number) => (
            <Accordion.Item
              key={item.question}
              value={String(index)}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <Accordion.Header className="flex">
                <Accordion.Trigger className="group flex flex-1 items-center justify-between gap-4 px-6 py-5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <span className="font-heading text-base font-semibold text-foreground">
                    {item.question}
                  </span>
                  <Plus
                    className="size-4 shrink-0 text-primary transition-transform duration-300 group-data-[panel-open]:rotate-45"
                    aria-hidden
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Reveal>
    </section>
  )
}
