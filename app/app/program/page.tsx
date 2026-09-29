import Link from "next/link"
import { ShieldCheck, Waves, TreeEvergreen, Heart } from "@phosphor-icons/react/dist/ssr"

import { createClient } from "@/lib/supabase/server"
import { toProgram, type ProgramRow } from "@/lib/programs"
import { buttonVariants } from "@/components/ui/button"
import { DokuLogo } from "@/components/ui/doku-logo"
import { CatalogHeader, ProgramPrice } from "@/components/app/program/program-price"
import { CatalogNoSubscription, DaysLabel, PointsList, ProgramTitle, ViewDetailLabel } from "@/components/app/program/program-copy"
import { cn } from "@/lib/utils"

export default async function ProgramCatalogPage() {
  const supabase = await createClient()
  const { data: programsRaw } = await supabase.from("programs").select("*").eq("is_active", true).order("duration_days")
  const programs = ((programsRaw as ProgramRow[] | null) ?? []).map(toProgram)
  const { data: ent } = await supabase.from("entitlements").select("program_id")
  const owned = new Set(((ent as { program_id: string }[] | null) ?? []).map((r) => r.program_id))
  const icons = [TreeEvergreen, Waves, Heart] as const

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-1 sm:px-0">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm ring-1 ring-foreground/5 md:p-10">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck weight="fill" className="size-3.5" aria-hidden />
            Diproses DOKU • IDR settle
          </span>
          <CatalogHeader />
          <p className="text-xs text-muted-foreground/80">
            <CatalogNoSubscription />
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-6 md:grid-cols-3">
        {programs.map((p, idx) => {
          const isOwned = owned.has(p.id)
          const Icon = icons[idx % icons.length]
          return (
            <div
              key={p.id}
              className="flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-sm ring-1 ring-foreground/5"
            >
              <div className="flex items-center gap-2">
                <span className="grid size-11 place-items-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
                  <Icon weight="fill" className="size-5" aria-hidden />
                </span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {p.durationDays} <DaysLabel />
                </span>
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold tracking-tight">
                <ProgramTitle slug={p.slug} fallback={p.title} />
              </h2>
              <div className="mt-3">
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  <ProgramPrice priceIdr={p.priceIdr} />
                </p>
                <p className="text-sm text-muted-foreground">
                  ~<ProgramPrice priceIdr={Math.round(p.priceIdr / p.durationDays)} />
                  /<DaysLabel />
                </p>
              </div>
              <PointsList />
              <div className="mt-6 space-y-3">
                {isOwned ? (
                  <Link href={`/app/program/${p.slug}`} className={cn(buttonVariants({ size: "lg" }), "h-11 w-full px-6")}>
                    Lanjutkan
                  </Link>
                ) : (
                  <Link
                    href={`/app/program/${p.slug}/checkout`}
                    aria-label={`Beli ${p.slug}`}
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 w-full gap-2 px-6")}
                  >
                    <DokuLogo className="h-5 px-1.5 py-0.5 text-[10px]" />
                    <span className="font-heading font-semibold">
                      <ProgramPrice priceIdr={p.priceIdr} />
                    </span>
                  </Link>
                )}
                <Link href={`/app/program/${p.slug}`} className="block text-center text-sm text-muted-foreground underline underline-offset-4">
                  <ViewDetailLabel />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3 border-t border-dashed pt-6 text-xs text-muted-foreground">
        <span>7 hari: pengenalan</span>
        <span className="hidden sm:inline">•</span>
        <span>21 hari: kebiasaan</span>
        <span className="hidden sm:inline">•</span>
        <span>90 hari: pendalaman</span>
      </div>
    </div>
  )
}
