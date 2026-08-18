import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LanguageProvider } from "@/components/providers/language-context"

const signInMock = vi.hoisted(() => vi.fn())
const signInWithOAuthMock = vi.hoisted(() => vi.fn())

vi.mock("@/lib/supabase/auth", () => ({
  signIn: signInMock,
  signUp: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithOAuth: signInWithOAuthMock } }),
}))

import { LoginForm } from "@/components/auth/login-form"

function renderLogin() {
  return render(
    <LanguageProvider>
      <LoginForm />
    </LanguageProvider>,
  )
}

describe("LoginForm", () => {
  it("renders the login fields and actions", () => {
    renderLogin()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Kata sandi")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Lanjut dengan Google" }),
    ).toBeInTheDocument()
  })

  it("shows a localized error for invalid credentials", async () => {
    signInMock.mockResolvedValue({ error: "Invalid login credentials" })
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText("Email"), "a@b.com")
    await user.type(screen.getByLabelText("Kata sandi"), "secret123")
    await user.click(screen.getByRole("button", { name: "Masuk" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email atau kata sandi salah.",
    )
  })

  it("starts Google OAuth from the browser client", async () => {
    signInWithOAuthMock.mockResolvedValue({})
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole("button", { name: "Lanjut dengan Google" }))

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: expect.stringContaining("/auth/callback") },
    })
  })
})