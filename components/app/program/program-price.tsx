"use client"

import { useLocale } from "@/components/providers/language-context"
import { getAppCopy } from "@/lib/i18n/app"
import { priceFor } from "@/lib/pricing"

export function ProgramPrice({ priceIdr, className }: { priceIdr: number; className?: string }) {
  const { locale } = useLocale()
  const price = priceFor(locale, priceIdr)
  return <span className={className}>{price.label}</span>
}

export function CatalogHeader() {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).program
  return (
    <>
      <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{copy.catalogTitle}</h1>
      <p className="text-sm text-muted-foreground md:text-base">{copy.catalogSubtitle}</p>
    </>
  )
}

export function PerDayPrice({ priceIdr }: { priceIdr: number }) {
  const { locale } = useLocale()
  const price = priceFor(locale, priceIdr)
  return <>{price.label}</>
}
