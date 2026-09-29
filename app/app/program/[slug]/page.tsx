import Link from "next/link"
import { notFound } from "next/navigation"
import { ShieldCheck, LockKey, CheckCircle } from "@phosphor-icons/react/dist/ssr"

import { createClient } from "@/lib/supabase/server"
import { toProgram, toProgress, toEnrollment, isDayUnlocked, type ProgramRow, type EnrollmentRow, type ProgressRow } from "@/lib/programs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { ProgramPrice } from "@/components/app/program/program-price"
import { PaywallTitle, PaywallDesc, LockedLabel, CompletedLabel, DayLabel, ProgramTitle, DaysLabel } from "@/components/app/program/program-copy"
import { cn } from "@/lib/utils"

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: progRaw } = await supabase.from("programs").select("*").eq("slug", slug).maybeSingle()
  if (!progRaw) return notFound()
  const program = toProgram(progRaw as ProgramRow)
  const { data: ent } = await supabase.from("entitlements").select("id").eq("program_id", program.id).maybeSingle()
  const hasAccess = !!ent

  const { data: enrollmentRaw } = await supabase
    .from("program_enrollments")
    .select("*")
    .eq("program_id", program.id)
    .eq("status", "active")
    .maybeSingle()
  const enrollment = enrollmentRaw ? toEnrollment(enrollmentRaw as EnrollmentRow) : null

  let progress: ReturnType<typeof toProgress>[] = []
  if (enrollment) {
    const { data: progRows } = await supabase.from("program_progress").select("*").eq("enrollment_id", enrollment.id)
    progress = ((progRows as ProgressRow[] | null) ?? []).map(toProgress)
  }
  const completedSet = new Set(progress.filter((p) => p.completedAt).map((p) => p.dayNumber))

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm ring-1 ring-foreground/5 md:p-10">
          <div className="pointer-events-none absolute -right-10 -top-10 size-64 opacity-[0.05]">
            <div className="absolute inset-0 rounded-full border border-primary/20 motion-safe:animate-breath" />
            <div className="absolute inset-[18%] rounded-full border border-primary/20 motion-safe:animate-breath [animation-delay:2.5s]" />
            <div className="absolute inset-[32%] rounded-full border border-primary/20 motion-safe:animate-breath [animation-delay:5s]" />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck weight="fill" className="size-3.5" aria-hidden />
            <PaywallTitle />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            <ProgramTitle slug={program.slug} fallback={program.title} />
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <ProgramPrice priceIdr={program.priceIdr} /> • {program.durationDays} <DaysLabel /> • 1 <DaysLabel /> = 1 sesi 7 fase
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            <PaywallDesc />
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={`/app/program/${slug}/checkout`}
              aria-label={`Beli dengan DOKU ${program.priceIdr}`}
              className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-6")}
            >
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ED1C24] px-2 py-1 text-xs font-bold tracking-tight text-white">
                <span className="grid size-3 place-items-center rounded-sm bg-white text-[8px] font-black leading-none text-[#ED1C24]">D</span>
                DOKU
              </span>
              <span className="font-heading font-semibold">
                <ProgramPrice priceIdr={program.priceIdr} />
              </span>
            </Link>
            <Link href="/app/program" className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11")}>
              Lihat katalog
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground/70">Data sesi & mood tersimpan di akunmu. Tanpa pelacakan.</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Preview hari (terkunci)</p>
          <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: Math.min(program.durationDays, 8) }, (_, i) => {
              const day = i + 1
              return (
                <div key={day} className="relative overflow-hidden rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {String(day).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium">
                      <DayLabel /> {day}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Tujuan: tenang • 7 fase</p>
                  <div className="absolute inset-x-0 bottom-0 bg-background/60 p-2 text-center backdrop-blur-sm">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <LockKey weight="fill" className="size-3.5" aria-hidden />
                      <LockedLabel />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          {program.durationDays > 8 ? (
            <p className="text-xs text-muted-foreground">+ {program.durationDays - 8} hari lainnya terbuka setelah pembelian.</p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-foreground/5 md:p-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          <ProgramTitle slug={program.slug} fallback={program.title} />
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {enrollment ? `Hari ${enrollment.currentDay} dari ${program.durationDays}` : "Belum mulai"} • {progress.filter((p) => p.completedAt).length}/{program.durationDays} selesai
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.round((completedSet.size / program.durationDays) * 100)}%` }}
          />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: program.durationDays }, (_, i) => {
          const day = i + 1
          const unlocked = isDayUnlocked(enrollment, day)
          const done = completedSet.has(day)
          return (
            <Card key={day} className={cn("rounded-2xl", !unlocked && "opacity-60")}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {String(day).padStart(2, "0")}
                  </span>
                  <DayLabel /> {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {done ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <CheckCircle weight="fill" className="size-3.5" aria-hidden />
                    <CompletedLabel />
                  </span>
                ) : unlocked ? (
                  <Link href={`/app/program/${slug}/day/${day}`} className={cn(buttonVariants({ size: "sm", variant: "default" }), "h-8")}>
                    Mulai
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <LockKey weight="fill" className="size-3.5" aria-hidden />
                    <LockedLabel />
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
