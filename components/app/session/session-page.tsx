"use client"

import { useState } from "react"
import Link from "next/link"

import { useLocale } from "@/components/providers/language-context"
import { buttonVariants } from "@/components/ui/button"
import { CheckinForm } from "./checkin-form"
import { SessionPlayer } from "./session-player"
import { SessionReady } from "./session-ready"
import { getAppCopy } from "@/lib/i18n/app"
import type { Session } from "@/lib/templates"

type Stage = "ready" | "playing" | "checkin" | "done"

export function SessionPageView({ session }: { session: Session }) {
  const { locale } = useLocale()
  const copy = getAppCopy(locale).checkin
  const [stage, setStage] = useState<Stage>("ready")
  const [moodBefore, setMoodBefore] = useState<number | undefined>(undefined)

  if (stage === "playing") {
    return <SessionPlayer session={session} onFinish={() => setStage("checkin")} />
  }

  if (stage === "checkin") {
    return (
      <CheckinForm
        sessionId={session.id}
        moodBefore={moodBefore}
        onDone={() => setStage("done")}
      />
    )
  }

  if (stage === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {copy.closing}
        </h1>
        <Link href="/app" className={buttonVariants()}>
          Dashboard
        </Link>
      </div>
    )
  }

  return (
    <SessionReady
      session={session}
      onStart={(value) => {
        setMoodBefore(value)
        setStage("playing")
      }}
    />
  )
}