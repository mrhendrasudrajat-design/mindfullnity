import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Landing } from "@/components/landing/landing"

describe("Landing (integration)", () => {
  it("renders the Indonesian landing by default", async () => {
    render(<Landing />)

    expect(
      await screen.findByRole("heading", {
        name: /Tenang dimulai dari satu napas/,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText("Tersimpan di browser ini")).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "Mulai" }).length).toBeGreaterThan(0)
  })

  it("switches the whole page to English and back", async () => {
    const user = userEvent.setup()
    render(<Landing />)

    await user.click(
      await screen.findByRole("button", { name: "Switch to English" }),
    )

    expect(
      screen.getByRole("heading", {
        name: /Calm starts with a single breath/,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText("Stored in this browser")).toBeInTheDocument()
    expect(
      await screen.findByRole("heading", { name: "Guided Meditation" }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Ganti ke Bahasa Indonesia" }),
    )

    expect(
      screen.getByRole("heading", {
        name: /Tenang dimulai dari satu napas/,
      }),
    ).toBeInTheDocument()
  })
})