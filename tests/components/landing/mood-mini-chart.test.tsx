import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MoodMiniChart } from "@/components/landing/mood-mini-chart"

describe("MoodMiniChart", () => {
  it("renders five mood level dots", () => {
    const { container } = render(<MoodMiniChart />)
    expect(container.querySelectorAll("circle")).toHaveLength(5)
  })

  it("is hidden from screen readers (decorative preview)", () => {
    const { container } = render(<MoodMiniChart />)
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })
})