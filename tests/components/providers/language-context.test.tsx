import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import {
  LANGUAGE_STORAGE_KEY,
  LanguageProvider,
  useLandingLocale,
} from "@/components/providers/language-context"

function Probe() {
  const { locale, toggleLocale } = useLandingLocale()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <button type="button" onClick={toggleLocale}>
        toggle
      </button>
    </div>
  )
}

function renderProbe() {
  return render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  )
}

describe("LanguageProvider", () => {
  it("defaults to Indonesian when nothing is stored", async () => {
    renderProbe()
    expect(screen.getByTestId("locale")).toHaveTextContent("id")
  })

  it("restores a persisted language from localStorage", async () => {
    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify({ language: "en" }),
    )
    renderProbe()
    await waitFor(() =>
      expect(screen.getByTestId("locale")).toHaveTextContent("en"),
    )
  })

  it("ignores malformed storage and stays on the default", async () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "{not-json")
    renderProbe()
    await waitFor(() =>
      expect(screen.getByTestId("locale")).toHaveTextContent("id"),
    )
  })

  it("toggles the locale and persists it", async () => {
    const user = userEvent.setup()
    renderProbe()

    await user.click(screen.getByRole("button", { name: "toggle" }))

    expect(screen.getByTestId("locale")).toHaveTextContent("en")
    const stored = JSON.parse(
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? "{}",
    )
    expect(stored.language).toBe("en")

    await user.click(screen.getByRole("button", { name: "toggle" }))
    expect(screen.getByTestId("locale")).toHaveTextContent("id")
  })
})

describe("useLandingLocale", () => {
  it("throws when used outside the provider", () => {
    expect(() => render(<Probe />)).toThrow(
      "useLandingLocale must be used within LanguageProvider",
    )
  })
})