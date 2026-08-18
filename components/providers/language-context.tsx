"use client"

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import { getInitialLocale, type Locale } from "@/lib/i18n/locale"
import {
  readStorage,
  STORAGE_KEYS,
  subscribeStorage,
  writeSettings,
  type Settings,
} from "@/lib/storage"

export const LANGUAGE_STORAGE_KEY = STORAGE_KEYS.settings

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLanguage(): string | null {
  const settings = readStorage<Settings>(STORAGE_KEYS.settings, {})
  return settings.language ?? null
}

function getSnapshot(): Locale {
  return getInitialLocale(readStoredLanguage())
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    subscribeStorage,
    getSnapshot,
    () => "id",
  )

  const value = useMemo<LanguageContextValue>(() => {
    const apply = (next: Locale) => {
      writeSettings({ language: next })
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

export function useLocale(): LanguageContextValue {
  return useLandingLocale()
}
