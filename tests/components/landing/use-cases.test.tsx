import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/landing/locale-context"
import { UseCases } from "@/components/landing/use-cases"

function renderUseCases() {
  return render(
    <LanguageProvider>
      <UseCases />
    </LanguageProvider>,
  )
}

describe("UseCases", () => {
  it("renders the section heading and lead", () => {
    renderUseCases()
    expect(
      screen.getByRole("heading", { name: "Dibuat untuk momen-momenmu" }),
    ).toBeInTheDocument()
  })

  it("renders all three use cases", () => {
    renderUseCases()
    for (const title of [
      "Pemula yang ingin mulai",
      "Jadwal yang padat",
      "Sulit tidur",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
    }
  })
})