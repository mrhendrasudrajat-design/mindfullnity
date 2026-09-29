import "server-only"

import { createClient } from "@/lib/supabase/server"

export async function hasEntitlement(userId: string, programId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return !!data
}

export async function hasEntitlementBySlug(userId: string, slug: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: prog } = await supabase.from("programs").select("id").eq("slug", slug).maybeSingle()
  if (!prog) return false
  return hasEntitlement(userId, (prog as { id: string }).id)
}

export async function getEntitlementsForUser(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("entitlements").select("program_id").eq("user_id", userId)
  if (error) throw new Error(error.message)
  return ((data as { program_id: string }[] | null) ?? []).map((r) => r.program_id)
}
