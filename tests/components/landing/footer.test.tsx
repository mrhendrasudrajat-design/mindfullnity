import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/providers/language-context"
import { Footer } from "@/components/landing/footer"

function renderFooter() {
  return render(
    <LanguageProvider>
      <Footer />
    </LanguageProvider>,
  )
}

describe("Footer", () => {
  it("renders the brand and privacy reassurance", () => {
    renderFooter()
    expect(screen.getByText("Mindfulnity", { selector: "span" })).toBeInTheDocument()
    expect(
      screen.getByText(
        "Data sesi & mood tersimpan di akunmu. Tanpa pelacakan.",
      ),
    ).toBeInTheDocument()
  })

  it("links to the section anchors and the app", () => {
    renderFooter()
    expect(screen.getByRole("link", { name: "Fitur" })).toHaveAttribute(
      "href",
      "#fitur",
    )
    expect(screen.getByRole("link", { name: "Cara Kerja" })).toHaveAttribute(
      "href",
      "#cara-kerja",
    )
    const startLinks = screen.getAllByRole("link", { name: "Mulai" })
    expect(startLinks).toHaveLength(2)
    for (const link of startLinks) {
      expect(link).toHaveAttribute("href", "/app")
    }
  })

  it("renders the current year", () => {
    renderFooter()
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Mindfulnity. Hak cipta.`),
    ).toBeInTheDocument()
  })
})