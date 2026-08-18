import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LanguageProvider } from "@/components/providers/language-context"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock("@/lib/supabase/actions", () => ({
  createSessionAction: vi.fn(async () => ({ id: "abc" })),
}))

import { Wizard } from "@/components/app/wizard/wizard"

function renderWizard() {
  return render(
    <LanguageProvider>
      <Wizard />
    </LanguageProvider>,
  )
}

describe("Wizard", () => {
  it("starts at personal start and moves through steps", async () => {
    const user = userEvent.setup()
    renderWizard()

    expect(screen.getByText(/Langkah 1 dari 5/)).toBeInTheDocument()
    expect(screen.getByText("Personal start")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Lanjut" }))
    expect(screen.getByText(/Langkah 2 dari 5/)).toBeInTheDocument()
  })

  it("requires a goal before continuing from the goal step", async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByRole("button", { name: "Lanjut" }))
    const continueButton = screen.getByRole("button", { name: "Lanjut" })
    expect(continueButton).toBeDisabled()

    await user.click(screen.getByRole("button", { name: /Tidur/ }))
    expect(continueButton).toBeEnabled()
  })

  it("requires a guide before continuing from the guide step", async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByRole("button", { name: "Lanjut" }))
    await user.click(screen.getByRole("button", { name: /Tidur/ }))
    await user.click(screen.getByRole("button", { name: "Lanjut" }))

    const continueButton = screen.getByRole("button", { name: "Lanjut" })
    expect(continueButton).toBeDisabled()
    await user.click(screen.getByRole("button", { name: /Mentor/ }))
    expect(continueButton).toBeEnabled()
  })

  it("persists a draft in localStorage so the wizard can resume", async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByRole("button", { name: "Lanjut" }))
    await user.click(screen.getByRole("button", { name: /Tidur/ }))

    const stored = JSON.parse(
      window.localStorage.getItem("mind-draft-v1") ?? "{}",
    )
    expect(stored.goal).toBe("sleep")
    expect(stored.step).toBe(1)
  })
})