export type Locale = "id" | "en"

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "id" || value === "en"
}

export function getInitialLocale(
  stored: string | null | undefined,
  fallback: Locale = "id",
): Locale {
  return isLocale(stored) ? stored : fallback
}

export function localeLabel(locale: Locale): string {
  return locale === "id" ? "Indonesia" : "English"
}

export function languageCode(locale: Locale): "id" | "en-US" {
  return locale === "id" ? "id" : "en-US"
}
