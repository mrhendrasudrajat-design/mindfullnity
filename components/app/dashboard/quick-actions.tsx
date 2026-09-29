"use client"

import { ChartLineUp, NotePencil, Waveform, CalendarCheck } from "@phosphor-icons/react"
import Link from "next/link"

import { useLocale } from "@/components/providers/language-context"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getAppCopy } from "@/lib/i18n/app"

export function QuickActions() {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).dashboard.quickActions

  const actions = [
    {
      href: "/app/session/new",
      label: copy.newSession,
      Icon: NotePencil,
      variant: "default" as const,
    },
    {
      href: "/app/sounds",
      label: copy.sounds,
      Icon: Waveform,
      variant: "outline" as const,
    },
    {
      href: "/app/mood",
      label: copy.mood,
      Icon: ChartLineUp,
      variant: "outline" as const,
    },
    {
      href: "/app/program",
      label: (copy as unknown as { program?: string }).program ?? "Program",
      Icon: CalendarCheck,
      variant: "outline" as const,
    },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ href, label, Icon, variant }) => (
        <Link
          key={href}
          href={href}
          className={cn(buttonVariants({ variant }), "gap-1.5")}
        >
          <Icon weight="fill" className="size-4" aria-hidden />
          {label}
        </Link>
      ))}
    </div>
  )
}