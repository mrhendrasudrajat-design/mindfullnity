import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { toProgram, type ProgramRow } from "@/lib/programs"
import { CheckoutButton } from "@/components/app/program/checkout-button"
import { CheckoutSummary } from "@/components/app/program/checkout-summary"

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: progRaw } = await supabase.from("programs").select("*").eq("slug", slug).maybeSingle()
  if (!progRaw) return notFound()
  const program = toProgram(progRaw as ProgramRow)
  const { data: ent } = await supabase.from("entitlements").select("id").eq("program_id", program.id).maybeSingle()
  if (ent) redirect(`/app/program/${slug}`)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm ring-1 ring-foreground/5">
        <div className="grid md:grid-cols-[1.15fr_0.85fr]">
          <CheckoutSummary priceIdr={program.priceIdr} durationDays={program.durationDays} title={program.title} />

          {/* Right — action */}
          <div className="flex flex-col p-8">
            <h2 className="font-heading text-base font-medium">Ringkasan</h2>
            <div className="mt-4 space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{program.title}</span>
                <span className="font-medium">
                  <span className="font-heading">
                    {/* price synced via CheckoutSummary client, duplicate for SSR fallback */}
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(program.priceIdr)}
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Metode</span>
                <span>DOKU (VA / QRIS / Kartu / Wallet)</span>
              </div>
              <div className="border-t border-dashed pt-3 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>
                  <span className="font-heading">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(program.priceIdr)}
                  </span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Pembayaran diproses DOKU. Tanpa DOKU key = mock langsung aktif (dev).</p>
            </div>

            <div className="mt-6">
              <CheckoutButton slug={slug} priceIdr={program.priceIdr} />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Dengan membayar, kamu menyetujui akses program di akun ini.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
