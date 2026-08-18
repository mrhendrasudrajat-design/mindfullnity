"use client"

import { SignOut } from "@phosphor-icons/react"
import Link from "next/link"

import { useLocale } from "@/components/providers/language-context"
import { Logo } from "@/components/landing/logo"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase/auth"
import { getAppCopy } from "@/lib/i18n/app"

export function AppNavbar({ userEmail }: { userEmail: string | null }) {
  const { locale, toggleLocale } = useLocale()
  const copy = getAppCopy(locale).auth

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4">
        <Link href="/app" aria-label="Mindfulnity">
          <Logo className="scale-90" />
        </Link>

        <div className="flex items-center gap-2">
          {userEmail ? (
            <span className="hidden max-w-40 truncate text-xs text-muted-foreground sm:block">
              {copy.signedInAs.replace("{email}", userEmail)}
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            aria-label={locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
          >
            {locale === "id" ? "EN" : "ID"}
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" aria-label={copy.signOut}>
              <SignOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">{copy.signOut}</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}