import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/landing/locale-context"
import { Faq } from "@/components/landing/faq"

function renderFaq() {
  return render(
    <LanguageProvider>
      <Faq />
    </LanguageProvider>,
  )
}

describe("Faq", () => {
  it("renders the heading and all questions", () => {
    renderFaq()
    expect(
      screen.getByRole("heading", { name: "Pertanyaan yang sering diajukan" }),
    ).toBeInTheDocument()
    for (const question of [
      "Apakah data saya aman?",
      "Apakah butuh koneksi internet?",
      "Berapa lama satu sesi?",
      "Apakah suara relaksasi di-streaming?",
      "Apa bedanya dengan aplikasi meditasi lain?",
    ]) {
      expect(screen.getByRole("button", { name: question })).toBeInTheDocument()
    }
  })

  it("shows the first answer by default", () => {
    renderFaq()
    expect(
      screen.getByText(/Semua data tersimpan di browser/),
    ).toBeInTheDocument()
  })

  it("toggles an answer when a question is clicked", async () => {
    const user = userEvent.setup()
    renderFaq()

    const question = screen.getByRole("button", {
      name: "Berapa lama satu sesi?",
    })
    await user.click(question)
    expect(screen.getByText(/Mulai dari 3 menit/)).toBeInTheDocument()

    await user.click(question)
    expect(screen.queryByText(/Mulai dari 3 menit/)).not.toBeInTheDocument()
  })
})