"use client"

import {
  CheckCircle,
  CloudRain,
  PersonSimpleTaiChi,
  Smiley,
  SmileyMeh,
  SmileySad,
  SmileyWink,
  SmileyXEyes,
  TreeEvergreen,
  Waves,
} from "@phosphor-icons/react"
import Image from "next/image"
import type { ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getLandingCopy } from "@/lib/i18n/landing"
import { cn } from "@/lib/utils"

import { useLandingLocale } from "@/components/providers/language-context"
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

const MOOD_SCALE = [
  { level: 1, Icon: SmileyXEyes },
  { level: 2, Icon: SmileySad },
  { level: 3, Icon: SmileyMeh },
  { level: 4, Icon: Smiley },
  { level: 5, Icon: SmileyWink },
]

const moodChartData = [
  { day: "01", mood: 3 },
  { day: "02", mood: 4 },
  { day: "03", mood: 2 },
  { day: "04", mood: 5 },
  { day: "05", mood: 3 },
  { day: "06", mood: 4 },
  { day: "07", mood: 4 },
]

const moodChartConfig = {
  mood: {
    label: "Mood",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

function MoodVisual() {
  const lastIndex = moodChartData.length - 1

  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-8 md:p-10">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          7 hari
        </p>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          +2 pola
        </span>
      </div>

      <div
        aria-hidden
        className="mt-6 flex items-center gap-2 text-muted-foreground"
      >
        {MOOD_SCALE.map(({ level, Icon }) => (
          <Icon key={level} weight="fill" className="size-4" />
        ))}
      </div>

      <ChartContainer
        config={moodChartConfig}
        className="mt-4 h-[140px] w-full"
      >
        <BarChart accessibilityLayer data={moodChartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tickLine={false}
            axisLine={false}
            width={24}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="mood" fill="var(--color-mood)" radius={[6, 6, 0, 0]}>
            {moodChartData.map((_, index) => (
              <Cell
                key={index}
                fillOpacity={index === lastIndex ? 1 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
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
