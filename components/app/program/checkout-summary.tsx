"use client"

import { ShieldCheck, CheckCircle, LockKey } from "@phosphor-icons/react"

import { useLocale } from "@/components/providers/language-context"
import { getAppCopy } from "@/lib/i18n/app"
import { priceFor } from "@/lib/pricing"

export function CheckoutSummary({ priceIdr, durationDays, title }: { priceIdr: number; durationDays: number; title: string }) {
  const { locale } = useLocale()
  const price = priceFor(locale, priceIdr)
  const priceEn = priceFor("en", priceIdr)
  const perDay = priceFor(locale, Math.round(priceIdr / durationDays))
  return (
    <>
      <div className="bg-card p-8 md:border-r md:border-border">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck weight="fill" className="size-3.5" aria-hidden />
          DOKU Checkout • IDR settle
        </span>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {title} — {durationDays} hari
        </p>

        <div className="mt-6 flex items-baseline gap-2">
          <p className="font-heading text-4xl font-semibold tracking-tight">{price.label}</p>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">~{perDay.label}/hari</span>
        </div>
        {locale === "en" ? <p className="mt-2 text-xs text-muted-foreground">EN: {priceEn.label} (display via FX 16500 — pay IDR)</p> : null}
        {locale === "id" ? <p className="mt-2 text-xs text-muted-foreground">EN: {priceEn.label} (tampil via kurs 16500 — bayar IDR)</p> : null}

        <ul className="mt-6 space-y-3">
          {getAppCopy(locale).program.checkoutPoints.map((t) => (
            <li key={t} className="flex items-center gap-2 text-sm">
              <CheckCircle weight="fill" className="size-4 shrink-0 text-primary" aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-xs text-muted-foreground">
          <LockKey weight="fill" className="size-4 text-primary" aria-hidden />
          {getAppCopy(locale).program.trustNote}
        </div>
      </div>
    </>
  )
}
