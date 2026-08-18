"use client"

import { GoogleLogo } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function GoogleButton({ label }: { label: string }) {
  async function handleClick() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
    >
      <GoogleLogo weight="bold" className="size-4" aria-hidden />
      {label}
    </Button>
  )
}
