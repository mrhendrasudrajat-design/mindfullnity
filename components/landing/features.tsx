"use client"

import {
  CheckCircle,
  CloudRain,
  PersonSimpleTaiChi,
  Smiley,
  TreeEvergreen,
  Waves,
} from "@phosphor-icons/react"
import Image from "next/image"
import type { ReactNode } from "react"

import { getLandingCopy } from "@/lib/landing-i18n"
import { cn } from "@/lib/utils"

import { useLandingLocale } from "./locale-context"
import { Reveal } from "./reveal"

function MeditationVisual() {
  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-8 md:p-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            01 — 07
          </p>
          <p className="mt-1 font-heading text-4xl font-semibold tracking-tight text-foreground">
            4 · 2 · 4
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          7 fase
        </span>
      </div>
      <div className="mt-10 flex items-center gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              index === 0 ? "bg-primary" : "bg-primary/20",
            )}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Tarik</span>
        <span>Tahan</span>
        <span>Hela</span>
      </div>
    </div>
  )
}

function SoundsVisual({ alt }: { alt: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border">
      <Image
        src="https://picsum.photos/seed/mindfulnity-ocean/800/900"
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent"
      />
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        {[Waves, CloudRain, TreeEvergreen].map((Icon, index) => (
          <span
            key={index}
            className="grid size-10 place-items-center rounded-full bg-background/15 text-background backdrop-blur"
          >
            <Icon weight="fill" className="size-4" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  )
}

function MoodVisual() {
  const values = [3, 4, 2, 5, 3, 4, 4]
  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-8 md:p-10">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          30 hari
        </p>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          +2 pola
        </span>
      </div>
      <div className="mt-10 flex h-28 items-end gap-2">
        {values.map((value, index) => (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-full",
              index === values.length - 1 ? "bg-primary" : "bg-primary/30",
            )}
            style={{ height: `${value * 20}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>01</span>
        <span>02</span>
        <span>03</span>
        <span>04</span>
        <span>05</span>
        <span>06</span>
        <span>07</span>
      </div>
    </div>
  )
}

type FeatureItem = (ReturnType<typeof getLandingCopy>["features"]["items"])[number]

function FeatureRow({
  icon,
  item,
  index,
}: {
  icon: ReactNode
  item: FeatureItem
  index: number
}) {
  const visual =
    index === 0 ? (
      <MeditationVisual />
    ) : index === 1 ? (
      <SoundsVisual alt={item.title} />
    ) : (
      <MoodVisual />
    )

  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <Reveal className={index % 2 === 1 ? "md:order-2" : undefined}>
        <div>
          <span className="grid size-11 place-items-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
            {icon}
          </span>
          <h3 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground">
            {item.title}
          </h3>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <ul className="mt-6 space-y-3">
            {item.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" weight="fill" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
      <Reveal delay={100} className={index % 2 === 1 ? "md:order-1" : undefined}>
        {visual}
      </Reveal>
    </div>
  )
}

export function Features() {
  const { locale } = useLandingLocale()
  const copy = getLandingCopy(locale).features

  const icons = [
    <PersonSimpleTaiChi key="meditation" weight="fill" className="size-5" aria-hidden />,
    <Waves key="sounds" weight="fill" className="size-5" aria-hidden />,
    <Smiley key="mood" weight="fill" className="size-5" aria-hidden />,
  ]

  return (
    <section id="fitur" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{copy.lead}</p>
        </div>
      </Reveal>

      <div className="mt-16 space-y-20 md:mt-20 md:space-y-28">
        {copy.items.map((item, index) => (
          <FeatureRow
            key={item.title}
            icon={icons[index]}
            item={item}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
