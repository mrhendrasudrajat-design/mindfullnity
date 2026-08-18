import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/providers/language-context"
import { Navbar } from "@/components/landing/navbar"

function renderNavbar() {
  return render(
    <LanguageProvider>
      <Navbar />
    </LanguageProvider>,
  )
}

describe("Navbar", () => {
  it("renders the brand, section links, and a start CTA", () => {
    renderNavbar()

    expect(screen.getByRole("link", { name: "Mindfulnity" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Fitur" })).toHaveAttribute(
      "href",
      "#fitur",
    )
    expect(screen.getByRole("link", { name: "Skenario" })).toHaveAttribute(
      "href",
      "#skenario",
    )
    expect(screen.getByRole("link", { name: "Cara Kerja" })).toHaveAttribute(
      "href",
      "#cara-kerja",
    )
    expect(screen.getByRole("link", { name: "Testimoni" })).toHaveAttribute(
      "href",
      "#testimoni",
    )
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute(
      "href",
      "#faq",
    )
    expect(screen.getByRole("link", { name: "Mulai" })).toHaveAttribute(
      "href",
      "/app",
    )
  })

  it("switches copy to English when the language button is toggled", async () => {
    const user = userEvent.setup()
    renderNavbar()

    await user.click(
      screen.getByRole("button", { name: "Switch to English" }),
    )

    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute(
      "href",
      "/app",
    )
    expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Ganti ke Bahasa Indonesia" }),
    ).toBeInTheDocument()
  })
})