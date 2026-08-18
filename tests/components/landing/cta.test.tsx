import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/providers/language-context"
import { Cta } from "@/components/landing/cta"

function renderCta() {
  return render(
    <LanguageProvider>
      <Cta />
    </LanguageProvider>,
  )
}

describe("Cta", () => {
  it("renders the headline and subtext", () => {
    renderCta()
    expect(
      screen.getByRole("heading", {
        name: "Tidak perlu sempurna, cukup mulai.",
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Lima menit sehari untuk dirimu sendiri."),
    ).toBeInTheDocument()
  })

  it("links the CTA button to /app", () => {
    renderCta()
    expect(screen.getByRole("link", { name: "Mulai" })).toHaveAttribute(
      "href",
      "/app",
    )
  })
})