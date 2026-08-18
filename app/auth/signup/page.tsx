import type { Metadata } from "next"

import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Buat akun",
  description: "Daftar akun Mindfulnity.",
}

export default function SignupPage() {
  return <SignupForm />
}
