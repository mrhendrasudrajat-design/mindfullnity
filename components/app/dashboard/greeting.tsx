"use client"

import { useState } from "react"

import { useLocale } from "@/components/providers/language-context"
import { formatDate, greetingForHour } from "@/lib/format"
import { getAppCopy } from "@/lib/i18n/app"

export function Greeting() {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).dashboard
  const [greeting] = useState(() => greetingForHour(new Date().getHours()))
  const date = formatDate(new Date(), locale)

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {date}
      </p>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {copy.greeting[greeting]}
      </h1>
    </div>
  )
}