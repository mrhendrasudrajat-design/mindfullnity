import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/landing/locale-context"
import { HowItWorks } from "@/components/landing/how-it-works"

function renderHowItWorks() {
  return render(
    <LanguageProvider>
      <HowItWorks />
    </LanguageProvider>,
  )
}

describe("HowItWorks", () => {
  it("renders the section heading", () => {
    renderHowItWorks()
    expect(
      screen.getByRole("heading", { name: "Cara kerjanya" }),
    ).toBeInTheDocument()
  })

  it("renders all three steps in order", () => {
    renderHowItWorks()
    const headings = screen
      .getAllByRole("heading")
      .map((heading) => heading.textContent)

    expect(headings).toContain("Siapkan sesi")
    expect(headings).toContain("Dengarkan & ikuti")
    expect(headings).toContain("Catat perasaanmu")
  })
})