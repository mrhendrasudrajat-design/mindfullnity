"use client"

import type { ReactNode } from "react"

import { LanguageProvider } from "@/components/providers/language-context"
import { AppNavbar } from "./app-navbar"
import { BottomNav } from "./bottom-nav"

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string | null
  children: ReactNode
}) {
  return (
    <LanguageProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <AppNavbar userEmail={userEmail} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 md:pb-10">
          {children}
        </main>
        <BottomNav />
      </div>
    </LanguageProvider>
  )
}