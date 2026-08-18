import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Reveal } from "@/components/landing/reveal"

describe("Reveal", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <p>konten</p>
      </Reveal>,
    )
    expect(screen.getByText("konten")).toBeInTheDocument()
  })

  it("becomes visible when observed (IntersectionObserver mocked)", () => {
    const { container } = render(
      <Reveal>
        <p>konten</p>
      </Reveal>,
    )
    const wrapper = container.firstElementChild
    expect(wrapper).toHaveClass("opacity-100")
    expect(wrapper).not.toHaveClass("opacity-0")
  })

  it("applies the given delay as a transition delay", () => {
    const { container } = render(
      <Reveal delay={150}>
        <p>konten</p>
      </Reveal>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.transitionDelay).toBe("150ms")
  })
})