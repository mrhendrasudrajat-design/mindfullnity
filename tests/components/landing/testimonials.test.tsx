import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/landing/locale-context"
import { Testimonials } from "@/components/landing/testimonials"

function renderTestimonials() {
  return render(
    <LanguageProvider>
      <Testimonials />
    </LanguageProvider>,
  )
}

describe("Testimonials", () => {
  it("renders the section heading and lead", () => {
    renderTestimonials()
    expect(
      screen.getByRole("heading", { name: "Kata mereka" }),
    ).toBeInTheDocument()
  })

  it("renders quotes and authors", () => {
    renderTestimonials()
    expect(screen.getByText(/Lima menit sebelum tidur/)).toBeInTheDocument()
    for (const name of ["Anita", "Rizky", "Sarah"]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it("renders a five-star rating for each testimonial", () => {
    renderTestimonials()
    expect(screen.getAllByLabelText("5 / 5")).toHaveLength(3)
  })
})