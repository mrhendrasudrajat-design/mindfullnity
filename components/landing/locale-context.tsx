"use client"

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import {
  getInitialLocale,
  type Locale,
} from "@/lib/landing-i18n"

export const LANGUAGE_STORAGE_KEY = "mind-settings"

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLanguage(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { language?: string }
    return parsed.language ?? null
  } catch {
    return null
  }
}

function getSnapshot(): Locale {
  return getInitialLocale(readStoredLanguage())
}

const listeners = new Set<() => void>()

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

function persistLanguage(locale: Locale) {
  if (typeof window === "undefined") return
  try {
    const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify({ ...existing, language: locale }),
    )
  } catch {
    // storage unavailable — ignore
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    subscribe,
    getSnapshot,
    () => "id",
  )

  const value = useMemo<LanguageContextValue>(() => {
    const apply = (next: Locale) => {
      persistLanguage(next)
      emitChange()
    }
    return {
      locale,
      setLocale: apply,
      toggleLocale: () => apply(locale === "id" ? "en" : "id"),
    }
  }, [locale])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLandingLocale(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLandingLocale must be used within LanguageProvider")
  }
  return ctx
}