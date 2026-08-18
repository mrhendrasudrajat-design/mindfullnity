import { LanguageProvider } from "@/components/providers/language-context"
import { Logo } from "@/components/landing/logo"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 px-4 py-12">
        <Link
          href="/"
          className="text-foreground transition-opacity hover:opacity-80"
          aria-label="Mindfulnity"
        >
          <Logo />
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </LanguageProvider>
  )
}
