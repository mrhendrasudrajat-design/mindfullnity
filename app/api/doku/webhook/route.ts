import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const raw = await request.text()
  const requestId = request.headers.get("Request-Id") ?? request.headers.get("request-id") ?? ""
  const timestamp = request.headers.get("Request-Timestamp") ?? request.headers.get("request-timestamp") ?? ""
  const signature = request.headers.get("Signature") ?? request.headers.get("signature") ?? ""

  // Verify signature jika DOKU terkonfigurasi; jika mock skip verify tapi tetap idempotent
  if (process.env.DOKU_SECRET_KEY && process.env.DOKU_CLIENT_ID) {
    const { verifyDokuSignature } = await import("@/lib/payments/doku")
    const sigOk = verifyDokuSignature(raw, requestId, timestamp, signature)
    if (!sigOk && signature) {
      return Response.json({ error: "invalid signature" }, { status: 401 })
    }
  }

  let body: {
    order?: { invoice_number?: string }
    transaction?: { status?: string; invoice_number?: string }
    invoice_number?: string
    status?: string
  }
  try {
    body = JSON.parse(raw) as typeof body
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 })
  }

  const invoiceId = body.order?.invoice_number ?? body.transaction?.invoice_number ?? body.invoice_number
  const statusRaw = (body.transaction?.status ?? body.status ?? "").toLowerCase()
  const isPaid = ["success", "paid", "completed", "settlement"].includes(statusRaw)

  if (!invoiceId) {
    return Response.json({ error: "missing invoice_number" }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return Response.json({ ok: true, mock: true }, { status: 200 })
  }

  // Idempotent: update payment by invoice_id
  const { data: payment } = await admin.from("payments").select("id, user_id, program_id, doku_status").eq("doku_invoice_id", invoiceId).maybeSingle()
  if (!payment) {
    // invoice belum ada (mungkin mock) — tetap 200
    return Response.json({ ok: true, note: "payment not found" }, { status: 200 })
  }
  const p = payment as { id: string; user_id: string; program_id: string; doku_status: string }
  if (p.doku_status === "paid" && isPaid) {
    return Response.json({ ok: true, idempotent: true }, { status: 200 })
  }

  await admin.from("payments").update({ doku_status: isPaid ? "paid" : statusRaw || "failed", raw_payload: body as unknown as Record<string, unknown> }).eq("id", p.id)

  if (isPaid) {
    await admin.from("entitlements").upsert(
      { user_id: p.user_id, program_id: p.program_id, source: "payment", payment_id: p.id },
      { onConflict: "user_id,program_id" },
    )
    const { data: existing } = await admin
      .from("program_enrollments")
      .select("id")
      .eq("user_id", p.user_id)
      .eq("program_id", p.program_id)
      .eq("status", "active")
      .maybeSingle()
    if (!existing) {
      await admin.from("program_enrollments").insert({ user_id: p.user_id, program_id: p.program_id, status: "active", current_day: 1 })
    }
  }

  return Response.json({ ok: true }, { status: 200 })
}
