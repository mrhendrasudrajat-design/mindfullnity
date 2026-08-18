import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { BreathingCircle } from "@/components/landing/breathing-circle"

describe("BreathingCircle", () => {
  it("is exposed as an image with an accessible label", () => {
    render(<BreathingCircle label="Ilustrasi lingkaran pernapasan" />)
    expect(
      screen.getByRole("img", { name: "Ilustrasi lingkaran pernapasan" }),
    ).toBeInTheDocument()
  })

  it("renders the animated rings and a solid center", () => {
    const { container } = render(
      <BreathingCircle label="breathing" />,
    )
    const rings = container.querySelectorAll(
      '[class*="animate-breath"]',
    )
    expect(rings.length).toBeGreaterThan(0)
  })
})