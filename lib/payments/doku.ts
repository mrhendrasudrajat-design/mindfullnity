import "server-only"

import crypto from "crypto"

import { priceFor, dokuAmountFor } from "@/lib/pricing"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Locale } from "@/lib/i18n/locale"

export function isDokuConfigured(): boolean {
  return !!process.env.DOKU_CLIENT_ID && !!process.env.DOKU_SECRET_KEY && !!process.env.DOKU_API_URL
}

type CreateCheckoutParams = {
  programSlug: string
  locale: Locale
  userId: string
  userEmail: string
}

type CreateCheckoutResult = {
  paymentId: string
  checkoutUrl: string
  isMock: boolean
}

export async function createDokuCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
  const supabase = await createClient()
  const { data: prog, error: progErr } = await supabase
    .from("programs")
    .select("id, slug, price_idr")
    .eq("slug", params.programSlug)
    .maybeSingle()
  if (progErr) throw new Error(progErr.message)
  if (!prog) throw new Error("Program tidak ditemukan")

  const program = prog as { id: string; slug: string; price_idr: number }
  const price = priceFor(params.locale, program.price_idr)
  const doku = dokuAmountFor(price)

  // Insert pending payment
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      user_id: params.userId,
      program_id: program.id,
      amount: doku.amount,
      currency: doku.currency,
      display_currency: price.displayCurrency,
      display_amount: price.displayAmount,
      doku_status: "pending",
      raw_payload: { locale: params.locale, price_idr: program.price_idr, display: price },
    })
    .select("id")
    .single()
  if (payErr) throw new Error(payErr.message)
  const paymentId = (payment as { id: string }).id

  // Mock mode: no DOKU keys → langsung grant entitlement
  if (!isDokuConfigured()) {
    const admin = createAdminClientOrNull()
    if (admin) {
      await grantEntitlementMock(paymentId, params.userId, program.id)
    }
    return { paymentId, checkoutUrl: `/app/program/${program.slug}?mock_paid=1`, isMock: true }
  }

  // Real DOKU Checkout
  const invoiceId = `mind-${paymentId.slice(0, 8)}-${Date.now()}`
  const requestId = crypto.randomUUID()
  const timestamp = new Date().toISOString()
  const payload = {
    order: {
      invoice_number: invoiceId,
      amount: doku.amount,
      currency: doku.currency,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/doku/webhook`,
    },
    customer: { email: params.userEmail },
    payment: { payment_due_date: 60 },
  }
  const payloadStr = JSON.stringify(payload)
  const signature = crypto
    .createHmac("sha256", process.env.DOKU_SECRET_KEY!)
    .update(`${process.env.DOKU_CLIENT_ID!}${requestId}${timestamp}${payloadStr}`)
    .digest("hex")

  const res = await fetch(`${process.env.DOKU_API_URL!.replace(/\/$/, "")}/checkout/v1/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Client-Id": process.env.DOKU_CLIENT_ID!,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      Signature: `HMACSHA256=${signature}`,
    },
    body: payloadStr,
  })
  const body = (await res.json().catch(() => ({}))) as { checkout_url?: string; response?: { checkout_url?: string } }

  const checkoutUrl = body.checkout_url ?? body.response?.checkout_url
  if (!res.ok || !checkoutUrl) {
    throw new Error(`DOKU checkout gagal: ${res.status} ${JSON.stringify(body).slice(0, 500)}`)
  }

  // Update payment dengan invoice & url
  const admin = createAdminClient()
  await admin
    .from("payments")
    .update({ doku_invoice_id: invoiceId, doku_checkout_url: checkoutUrl, raw_payload: { ...payload, response: body } })
    .eq("id", paymentId)

  return { paymentId, checkoutUrl, isMock: false }
}

function createAdminClientOrNull() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

async function grantEntitlementMock(paymentId: string, userId: string, programId: string) {
  try {
    const admin = createAdminClient()
    await admin
      .from("payments")
      .update({ doku_status: "paid", doku_invoice_id: `mock-${paymentId.slice(0, 8)}` })
      .eq("id", paymentId)
    await admin.from("entitlements").upsert(
      { user_id: userId, program_id: programId, source: "payment", payment_id: paymentId },
      { onConflict: "user_id,program_id" },
    )
    const { data: existing } = await admin
      .from("program_enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("program_id", programId)
      .eq("status", "active")
      .maybeSingle()
    if (!existing) {
      await admin.from("program_enrollments").insert({ user_id: userId, program_id: programId, status: "active", current_day: 1 })
    }
  } catch {
    // ignore mock errors (mis. SUPABASE_SECRET_KEY not set)
  }
}

export function verifyDokuSignature(rawBody: string, requestId: string, timestamp: string, signatureHeader: string): boolean {
  const secret = process.env.DOKU_SECRET_KEY
  const clientId = process.env.DOKU_CLIENT_ID
  if (!secret || !clientId) return false
  const expected = crypto.createHmac("sha256", secret).update(`${clientId}${requestId}${timestamp}${rawBody}`).digest("hex")
  const a = Buffer.from(signatureHeader.replace("HMACSHA256=", ""))
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
