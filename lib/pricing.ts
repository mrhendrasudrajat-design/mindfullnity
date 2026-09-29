import type { Locale } from "@/lib/i18n/locale"

export const FX_IDR_PER_USD = Number(process.env.FX_IDR_PER_USD ?? process.env.NEXT_PUBLIC_FX_IDR_PER_USD ?? 16500)

export type Price = {
  amount: number
  currency: "IDR" | "USD"
  displayCurrency: "IDR" | "USD"
  displayAmount: number
  label: string
  idrAmount: number
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function priceFor(locale: Locale, priceIdr: number): Price {
  const fx = FX_IDR_PER_USD > 0 ? FX_IDR_PER_USD : 16500
  if (locale === "id") {
    return {
      amount: priceIdr,
      currency: "IDR",
      displayCurrency: "IDR",
      displayAmount: priceIdr,
      label: formatIDR(priceIdr),
      idrAmount: priceIdr,
    }
  }
  const usd = Math.round((priceIdr / fx) * 100) / 100
  return {
    amount: usd,
    currency: "USD",
    displayCurrency: "USD",
    displayAmount: usd,
    label: formatUSD(usd),
    idrAmount: priceIdr,
  }
}

export function dokuAmountFor(price: Price): { amount: number; currency: "IDR" } {
  // DOKU settlement selalu IDR; jika display USD tetap kirim IDR
  return { amount: price.idrAmount, currency: "IDR" }
}
