import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SessionPageView } from "@/components/app/session/session-page"
import { getSession } from "@/lib/supabase/sessions"

export const metadata: Metadata = {
  title: "Sesi",
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession(id)
  if (!session) notFound()

  return <SessionPageView session={session} />
}