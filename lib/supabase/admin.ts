import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) {
    throw new Error("SUPABASE_SECRET_KEY belum di-set — butuh untuk webhook DOKU (service_role)")
  }
  return createSupabaseClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
