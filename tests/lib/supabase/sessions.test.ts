import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  client: null as unknown,
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => state.client),
}))

import {
  getSession,
  insertSession,
  listSessions,
  updateSessionCheckin,
} from "@/lib/supabase/sessions"

function buildClient({ rows, error }: { rows?: unknown[]; error?: { message: string } }) {
  const payload = error
    ? { data: null, error }
    : { data: rows, error: null }
  const row = rows?.[0] ?? null

  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.update = vi.fn(() => chain)
  chain.maybeSingle = vi.fn(async () => ({ data: row, error: error ?? null }))
  chain.single = vi.fn(async () => ({ data: row, error: error ?? null }))
  chain.then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(payload).then(onFulfilled)

  const from = vi.fn().mockReturnValue(chain)
  state.client = { from }
  return { from, chain }
}

const ROW = {
  id: "abc-123",
  title: "Tidur · 10 mnt",
  goal: "sleep",
  guide: "mentor",
  sound_mix: { nature: ["rain"], instruments: [] },
  duration_min: 10,
  phases: [{ id: "arrive" as const, title: "Kedatangan", lines: ["x"] }],
  mood_before: null,
  mood_after: null,
  reflection: null,
  integration_action: null,
  created_at: "2026-08-18T10:00:00.000Z",
}

beforeEach(() => {
  state.client = null
})

describe("listSessions", () => {
  it("queries sessions for the current user and maps rows", async () => {
    const { from, chain } = buildClient({ rows: [ROW] })
    const sessions = await listSessions()

    expect(from).toHaveBeenCalledWith("sessions")
    expect(chain.select).toHaveBeenCalledWith("*")
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false })
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toMatchObject({
      id: "abc-123",
      goal: "sleep",
      durationMin: 10,
      soundMix: { nature: ["rain"], instruments: [] },
    })
  })

  it("returns an empty array when there are no rows", async () => {
    buildClient({ rows: [] })
    expect(await listSessions()).toEqual([])
  })

  it("throws when the query fails", async () => {
    buildClient({ error: { message: "permission denied" } })
    await expect(listSessions()).rejects.toThrow("permission denied")
  })
})

describe("getSession", () => {
  it("filters by id and returns the mapped session", async () => {
    const { chain } = buildClient({ rows: [ROW] })
    const session = await getSession("abc-123")

    expect(chain.eq).toHaveBeenCalledWith("id", "abc-123")
    expect(session?.id).toBe("abc-123")
  })

  it("returns null when not found", async () => {
    buildClient({ rows: [] })
    expect(await getSession("missing")).toBeNull()
  })
})

describe("insertSession", () => {
  it("inserts a new session with snake_case columns", async () => {
    const { chain } = buildClient({ rows: [ROW] })
    const session = await insertSession({
      title: "Tidur · 10 mnt",
      goal: "sleep",
      guide: "mentor",
      soundMix: { nature: ["rain"], instruments: [] },
      durationMin: 10,
      phases: ROW.phases,
    })

    expect(chain.insert).toHaveBeenCalledWith({
      title: "Tidur · 10 mnt",
      goal: "sleep",
      guide: "mentor",
      sound_mix: { nature: ["rain"], instruments: [] },
      duration_min: 10,
      phases: ROW.phases,
      mood_before: null,
    })
    expect(chain.single).toHaveBeenCalled()
    expect(session.id).toBe("abc-123")
  })
})

describe("updateSessionCheckin", () => {
  it("updates the check-in fields for a session", async () => {
    const { chain } = buildClient({ rows: [{ ...ROW, mood_after: 4 }] })
    await updateSessionCheckin("abc-123", {
      moodBefore: 3,
      moodAfter: 4,
      reflection: "lega",
      integrationAction: "minum air",
    })

    expect(chain.update).toHaveBeenCalledWith({
      mood_before: 3,
      mood_after: 4,
      reflection: "lega",
      integration_action: "minum air",
    })
    expect(chain.eq).toHaveBeenCalledWith("id", "abc-123")
  })
})