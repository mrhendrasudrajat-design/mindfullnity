import { languageCode, type Locale } from "@/lib/i18n/locale"

export function formatDuration(minutes: number, locale: Locale): string {
  if (minutes < 1) return locale === "id" ? "kurang dari 1 mnt" : "less than 1 min"
  const rounded = Math.round(minutes)
  return locale === "id" ? `${rounded} mnt` : `${rounded} min`
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(languageCode(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatShortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(languageCode(locale), {
    day: "numeric",
    month: "short",
  }).format(date)
}

export type Greeting = "morning" | "afternoon" | "evening"

export function greetingForHour(hour: number): Greeting {
  if (hour >= 4 && hour < 11) return "morning"
  if (hour >= 11 && hour < 16) return "afternoon"
  return "evening"
}

export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
