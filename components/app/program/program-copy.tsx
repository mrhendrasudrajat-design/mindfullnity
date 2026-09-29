"use client"

import { CheckCircle } from "@phosphor-icons/react"

import { useLocale } from "@/components/providers/language-context"
import { getAppCopy } from "@/lib/i18n/app"

export function CatalogNoSubscription() {
  const { locale } = useLocale()
  return <span>{getAppCopy(locale).program.catalogNoSubscription}</span>
}

export function ViewDetailLabel() {
  const { locale } = useLocale()
  return <>{getAppCopy(locale).program.viewDetail}</>
}

export function ProgramTitle({ slug, fallback }: { slug: string; fallback: string }) {
  const { locale } = useLocale()
  const t = getAppCopy(locale).program.titles as Record<string, string>
  return <>{t[slug] ?? fallback}</>
}

export function TrustNote() {
  const { locale } = useLocale()
  return <>{getAppCopy(locale).program.trustNote}</>
}

export function DaysLabel() {
  const { locale } = useLocale()
  return <>{getAppCopy(locale).program.days}</>
}

export function PaywallTitle() {
  const { locale } = useLocale()
  return <>{getAppCopy(locale).program.paywallTitle}</>
}

export function PaywallDesc() {
  const { locale } = useLocale()
  return <>{getAppCopy(locale).program.paywallDesc}</>
}

export function LockedLabel() {
  const { locale } = useLocale()
  return <>{getAppCopy(locale).program.locked}</>
}

export function CompletedLabel() {
  const { locale } = useLocale()
  return <>{getAppCopy(locale).program.completed}</>
}

export function DayLabel() {
  const { locale } = useLocale()
  return <>{getAppCopy(locale).program.day}</>
}

export function PointsList() {
  const { locale } = useLocale()
  const points: readonly string[] = getAppCopy(locale).program.points
  return (
    <ul className="mt-6 flex-1 space-y-3">
      {points.map((pt) => (
        <li key={pt} className="flex items-center gap-2 text-sm">
          <CheckCircle weight="fill" className="size-4 shrink-0 text-primary" aria-hidden />
          <span>{pt}</span>
        </li>
      ))}
    </ul>
  )
}
