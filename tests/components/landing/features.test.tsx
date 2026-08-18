import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/providers/language-context"
import { Features } from "@/components/landing/features"

function renderFeatures() {
  return render(
    <LanguageProvider>
      <Features />
    </LanguageProvider>,
  )
}

describe("Features", () => {
  it("renders the section heading and lead", () => {
    renderFeatures()
    expect(
      screen.getByRole("heading", { name: "Satu ruang untuk menenangkan diri" }),
    ).toBeInTheDocument()
  })

  it("renders all three feature headings in Indonesian", () => {
    renderFeatures()
    for (const title of [
      "Meditasi Terpandu",
      "Suara Relaksasi",
      "Mood Tracker",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
    }
  })

  it("renders detail points for each feature", () => {
    renderFeatures()
    expect(
      screen.getByText(/7 fase yang mengalir/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/tanpa streaming/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/tersimpan di akunmu/),
    ).toBeInTheDocument()
  })

  it("uses a real image with an accessible alt text for the sounds row", () => {
    renderFeatures()
    const image = screen.getByAltText("Suara Relaksasi")
    expect(image).toHaveAttribute(
      "src",
      "https://picsum.photos/seed/mindfulnity-ocean/800/900",
    )
  })

  it("renders the mood tracker as a bar chart", () => {
    const { container } = renderFeatures()
    expect(screen.getByText("7 hari")).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-testid="recharts-bar"]'),
    ).toBeInTheDocument()
  })
})