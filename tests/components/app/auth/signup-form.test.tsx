import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LanguageProvider } from "@/components/providers/language-context"

const signUpMock = vi.hoisted(() => vi.fn())

vi.mock("@/lib/supabase/auth", () => ({
  signIn: vi.fn(),
  signUp: signUpMock,
  signOut: vi.fn(),
}))

import { SignupForm } from "@/components/auth/signup-form"

function renderSignup() {
  return render(
    <LanguageProvider>
      <SignupForm />
    </LanguageProvider>,
  )
}

describe("SignupForm", () => {
  it("renders the signup fields", () => {
    renderSignup()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Kata sandi")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Daftar" })).toBeInTheDocument()
  })

  it("shows the confirm-email message when no session is created", async () => {
    signUpMock.mockResolvedValue({ error: "confirm-email" })
    const user = userEvent.setup()
    renderSignup()

    await user.type(screen.getByLabelText("Email"), "a@b.com")
    await user.type(screen.getByLabelText("Kata sandi"), "secret123")
    await user.click(screen.getByRole("button", { name: "Daftar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Cek emailmu untuk konfirmasi/,
    )
  })
})