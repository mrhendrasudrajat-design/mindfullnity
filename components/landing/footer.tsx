"use client"

import { ShieldCheck } from "@phosphor-icons/react"

import { getLandingCopy } from "@/lib/landing-i18n"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { Logo } from "./logo"
import { useLandingLocale } from "./locale-context"

export function Footer() {
  const { locale } = useLandingLocale()
  const copy = getLandingCopy(locale).footer
  const nav = getLandingCopy(locale).nav

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {copy.tagline}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            {copy.privacy}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
            {[...nav.links, { href: "/app", label: nav.start }].map((link) => (
              <a
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="/app"
            className={cn(buttonVariants({ size: "sm" }), "w-fit")}
          >
            {nav.start}
          </a>
          <p className="mt-2 text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} Mindfulnity. {copy.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}