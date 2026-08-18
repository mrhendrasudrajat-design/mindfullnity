import { AppShell } from "@/components/app/shell/app-shell"
import { requireUser } from "@/lib/supabase/dal"

export default async function AppLayout({
  children,
}: LayoutProps<"/app">) {
  const user = await requireUser()

  return <AppShell userEmail={user.email ?? null}>{children}</AppShell>
}