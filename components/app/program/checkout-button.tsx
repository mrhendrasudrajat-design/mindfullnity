"use client"

import { useState } from "react"

import { useLocale } from "@/components/providers/language-context"
import { Button } from "@/components/ui/button"
import { createCheckoutAction } from "@/lib/supabase/actions"
import { getAppCopy } from "@/lib/i18n/app"
import { DokuLogo } from "@/components/ui/doku-logo"
import { priceFor } from "@/lib/pricing"

export function CheckoutButton({ slug, priceIdr }: { slug: string; priceIdr: number }) {
  const { locale } = useLocale()
  const t = getAppCopy(locale).program
  const price = priceFor(locale, priceIdr)
  const [loading, setLoading] = useState(false)
  return (
    <Button
      size="lg"
      className="h-12 w-full gap-2 px-6"
      disabled={loading}
      aria-label={`${t.buy} ${price.label}`}
      onClick={async () => {
        setLoading(true)
        try {
          const res = await createCheckoutAction(slug, locale)
          if (res?.checkoutUrl) window.location.href = res.checkoutUrl
        } finally {
          setLoading(false)
        }
      }}
    >
      {loading ? (
        t.checkoutTitle + "…"
      ) : (
        <>
          <DokuLogo className="h-5 px-1.5 py-0.5 text-[10px]" />
          <span className="font-heading font-semibold">{price.label}</span>
        </>
      )}
    </Button>
  )
}
