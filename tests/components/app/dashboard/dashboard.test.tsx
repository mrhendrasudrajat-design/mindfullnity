import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LanguageProvider } from "@/components/providers/language-context"
import { Dashboard } from "@/components/app/dashboard/dashboard"
import type { Session } from "@/lib/templates"
import type { MoodEntry } from "@/lib/supabase/moods"
import type { SessionStats } from "@/lib/stats"

const session: Session = {
  id: "abc",
  createdAt: "2026-08-18T10:00:00.000Z",
  title: "Tidur · 10 mnt",
  goal: "sleep",
  guide: "mentor",
  soundMix: { nature: ["rain"], instruments: [] },
  durationMin: 10,
  phases: [],
}

const stats: SessionStats = {
  totalMinutes: 10,
  sessionCount: 1,
  activeDaysLast7: 1,
}

function renderDashboard(overrides: {
  sessions?: Session[]
  moods?: MoodEntry[]
  stats?: SessionStats
} = {}) {
  return render(
    <LanguageProvider>
      <Dashboard
        sessions={overrides.sessions ?? []}
        moods={overrides.moods ?? []}
        stats={overrides.stats ?? { totalMinutes: 0, sessionCount: 0, activeDaysLast7: 0 }}
      />
    </LanguageProvider>,
  )
}

describe("Dashboard", () => {
  it("shows an inviting empty state for new users", () => {
    renderDashboard()
    expect(
      screen.getByText("Belum ada sesi. Mulai yang pertama?"),
    ).toBeInTheDocument()
    expect(
      screen.getByText("Belum ada catatan mood.", { exact: false }),
    ).toBeInTheDocument()
  })

  it("shows quick actions that link to the app routes", () => {
    renderDashboard()
    expect(screen.getByRole("link", { name: "Sesi Baru" })).toHaveAttribute(
      "href",
      "/app/session/new",
    )
    expect(screen.getByRole("link", { name: "Suara Relaksasi" })).toHaveAttribute(
      "href",
      "/app/sounds",
    )
    expect(screen.getByRole("link", { name: "Catat Mood" })).toHaveAttribute(
      "href",
      "/app/mood",
    )
  })

  it("renders stats and the recent session archive", () => {
    renderDashboard({ sessions: [session], stats })
    expect(screen.getByText("10 mnt")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("Tidur · 10 mnt")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Tidur · 10 mnt/ })).toHaveAttribute(
      "href",
      "/app/session/abc",
    )
  })
})