"use client"

import Link from "next/link"
import { ShieldCheck, LockKey } from "@phosphor-icons/react"

import { useLocale } from "@/components/providers/language-context"
import { buttonVariants } from "@/components/ui/button"
import { getAppCopy } from "@/lib/i18n/app"
import { priceFor } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import { DokuLogo } from "@/components/ui/doku-logo"

export function Paywall({ slug, priceLabel, priceIdr }: { slug: string; priceLabel: string; priceIdr?: number }) {
  const { locale } = useLocale()
  const t = getAppCopy(locale).program
  const label = priceIdr !== undefined ? priceFor(locale, priceIdr).label : priceLabel
  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-sm ring-1 ring-foreground/5">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
        <ShieldCheck weight="fill" className="size-3.5" aria-hidden />
        {t.paywallTitle}
      </span>
      <h3 className="mt-3 font-heading text-xl font-semibold tracking-tight">{t.paywallTitle}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{t.paywallDesc}</p>
      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
        <LockKey weight="fill" className="size-3.5 text-primary" aria-hidden />
        {label}
      </p>
      <Link
        href={`/app/program/${slug}/checkout`}
        aria-label={`${t.buy} ${label}`}
        className={cn(buttonVariants({ size: "lg" }), "mt-4 h-11 gap-2")}
      >
        <DokuLogo className="h-5 px-1.5 py-0.5 text-[10px]" />
        <span className="font-heading font-semibold">{label}</span>
      </Link>
    </div>
  )
}
