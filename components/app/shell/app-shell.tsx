"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { LanguageProvider } from "@/components/providers/language-context"
import { soundEngine } from "@/lib/sound-engine"
import { voicePlayer } from "@/lib/voice-player"
import { AppNavbar } from "./app-navbar"
import { BottomNav } from "./bottom-nav"

export function AppShell({
  userEmail,
  children,
}: {
  userEmail: string | null
  children: ReactNode
}) {
  const pathname = usePathname()
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (prevPath.current === pathname) return
    prevPath.current = pathname
    soundEngine.stopAll()
    voicePlayer.stop()
  }, [pathname])

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