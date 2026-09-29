"use client"

import { House, ChartLineUp, NotePencil, Waveform, CalendarCheck } from "@phosphor-icons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useLocale } from "@/components/providers/language-context"
import { cn } from "@/lib/utils"
import { getAppCopy } from "@/lib/i18n/app"

const ITEMS = [
  { href: "/app", key: "dashboard" },
  { href: "/app/program", key: "program" },
  { href: "/app/sounds", key: "sounds" },
  { href: "/app/mood", key: "mood" },
] as const

const ICONS = {
  dashboard: House,
  program: CalendarCheck,
  sounds: Waveform,
  mood: ChartLineUp,
} as const

export function BottomNav() {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).dashboard.shell
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-stretch gap-1 px-2 py-1.5">
        <Link
          href="/app/session/new"
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-primary",
            "bg-primary/10",
          )}
        >
          <NotePencil weight="fill" className="size-5" aria-hidden />
          {copy.newSession}
        </Link>
        {ITEMS.map(({ href, key }) => {
          const Icon = ICONS[key]
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon weight={active ? "fill" : "regular"} className="size-5" aria-hidden />
              {copy[key]}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}