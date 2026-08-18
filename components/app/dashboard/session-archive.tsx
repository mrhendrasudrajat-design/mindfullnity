"use client"

import { ArrowRight, Sparkle } from "@phosphor-icons/react"
import Link from "next/link"

import { useLocale } from "@/components/providers/language-context"
import { formatShortDate } from "@/lib/format"
import { getAppCopy } from "@/lib/i18n/app"
import type { Session } from "@/lib/templates"
import { sortSessionsNewestFirst } from "@/lib/stats"

export function SessionArchive({ sessions }: { sessions: Session[] }) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).dashboard.archive
  const recent = sortSessionsNewestFirst(sessions).slice(0, 5)

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border p-6">
        <Sparkle className="size-5 text-primary" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="font-heading font-medium">{copy.empty}</p>
          <Link
            href="/app/session/new"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {copy.emptyCta}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section aria-labelledby="archive-title" className="flex flex-col gap-3">
      <h2 id="archive-title" className="font-heading text-base font-medium">
        {copy.title}
      </h2>
      <ul className="flex flex-col gap-2">
        {recent.map((session) => (
          <li key={session.id}>
            <Link
              href={`/app/session/${session.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-sm font-medium">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatShortDate(new Date(session.createdAt), locale)}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}