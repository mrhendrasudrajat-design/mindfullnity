"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { completeProgramDayAction, generateSessionAction } from "@/lib/supabase/actions"
import { cn } from "@/lib/utils"
import { useLocale } from "@/components/providers/language-context"

export function DayPlayer({
  programSlug,
  programTitle,
  dayNumber,
  enrollmentId,
  dayTitle,
  goal,
  sessionId,
}: {
  programSlug: string
  programTitle: string
  dayNumber: number
  enrollmentId: string
  dayTitle: string
  goal: string
  sessionId: string | null
}) {
  const { locale } = useLocale()
  const router = useRouter()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId)
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await generateSessionAction({
        goal: goal as "sleep" | "stress" | "focus" | "confidence" | "relax" | "energy",
        guide: "mentor",
        soundMix: { nature: ["rain"], instruments: [] },
        durationMin: 10,
        locale,
      })
      setCurrentSessionId(res.id)
      await completeProgramDayAction(enrollmentId, dayNumber, res.id)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!currentSessionId) return
    setLoading(true)
    try {
      await completeProgramDayAction(enrollmentId, dayNumber, currentSessionId)
      router.push(`/app/program/${programSlug}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{programTitle}</p>
        <h1 className="text-xl font-semibold">
          Hari {dayNumber} — {dayTitle}
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sesi hari ini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!currentSessionId ? (
            <Button onClick={handleStart} disabled={loading}>
              {loading ? "Menyiapkan..." : "Mulai sesi 10 menit"}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">Sesi dibuat — lanjut ke pemutar atau tandai selesai.</p>
              <div className="flex gap-2">
                <Link href={`/app/session/${currentSessionId}`} className={cn(buttonVariants({ variant: "default" }))}>
                  Buka pemutar
                </Link>
                <Button variant="outline" onClick={handleComplete} disabled={loading}>
                  Tandai selesai & buka hari berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Link href={`/app/program/${programSlug}`} className="text-sm underline">
        Kembali ke program
      </Link>
    </div>
  )
}
