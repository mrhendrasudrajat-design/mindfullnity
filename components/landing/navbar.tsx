"use client"

import { GlobeHemisphereWest } from "@phosphor-icons/react"

import { getLandingCopy } from "@/lib/landing-i18n"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { Logo } from "./logo"
import { useLandingLocale } from "./locale-context"

export function Navbar() {
  const { locale, toggleLocale } = useLandingLocale()
  const copy = getLandingCopy(locale)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" aria-label="Mindfulnity">
          <Logo />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {copy.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={
              locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"
            }
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 font-medium",
            )}
          >
            <GlobeHemisphereWest className="size-4" aria-hidden />
            {locale === "id" ? "EN" : "ID"}
          </button>
          <a
            href="/app"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            {copy.nav.start}
          </a>
        </div>
      </nav>
    </header>
  )
}