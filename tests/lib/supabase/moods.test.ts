import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  client: null as unknown,
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => state.client),
}))

import { listMoods, upsertMood } from "@/lib/supabase/moods"

function buildClient({
  rows,
  error,
  existing,
}: {
  rows?: unknown[]
  error?: { message: string }
  existing?: { id: string } | null
}) {
  const payload = error
    ? { data: null, error }
    : { data: rows, error: null }
  const row = rows?.[0] ?? null

  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.upsert = vi.fn(() => chain)
  chain.update = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.maybeSingle = vi.fn(async () => ({ data: existing ?? null, error: null }))
  chain.single = vi.fn(async () => ({ data: row, error: error ?? null }))
  chain.then = (onFulfilled: (value: unknown) => unknown) =>
    Promise.resolve(payload).then(onFulfilled)

  const from = vi.fn().mockReturnValue(chain)
  state.client = { from }
  return { from, chain }
}

const ROW = {
  date: "2026-08-18",
  mood: 4,
  note: "tenang",
  source: "manual",
}

beforeEach(() => {
  state.client = null
})

describe("listMoods", () => {
  it("selects the visible columns ordered by date", async () => {
    const { from, chain } = buildClient({ rows: [ROW, { ...ROW, date: "2026-08-17" }] })
    const moods = await listMoods()

    expect(from).toHaveBeenCalledWith("mood_entries")
    expect(chain.select).toHaveBeenCalledWith("date, mood, note, source")
    expect(chain.order).toHaveBeenCalledWith("date", { ascending: false })
    expect(moods).toHaveLength(2)
    expect(moods[0]).toEqual({
      date: "2026-08-18",
      mood: 4,
      note: "tenang",
      source: "manual",
    })
  })

  it("maps null note to undefined", async () => {
    buildClient({ rows: [{ ...ROW, note: null }] })
    const [entry] = await listMoods()
    expect(entry.note).toBeUndefined()
  })

  it("throws on error", async () => {
    buildClient({ error: { message: "boom" } })
    await expect(listMoods()).rejects.toThrow("boom")
  })
})

describe("upsertMood", () => {
  it("upserts check-in entries on the (user_id, session_id) conflict", async () => {
    const { chain } = buildClient({ rows: [ROW] })
    const entry = await upsertMood({
      date: "2026-08-18",
      mood: 4,
      source: "checkin",
      sessionId: "11111111-1111-1111-1111-111111111111",
    })

    expect(chain.upsert).toHaveBeenCalledWith(
      {
        date: "2026-08-18",
        mood: 4,
        note: null,
        source: "checkin",
        session_id: "11111111-1111-1111-1111-111111111111",
      },
      { onConflict: "user_id,session_id" },
    )
    expect(chain.single).toHaveBeenCalled()
    expect(entry.mood).toBe(4)
  })

  it("inserts a manual entry when none exists for the day", async () => {
    const { from, chain } = buildClient({ rows: [ROW], existing: null })
    await upsertMood({ date: "2026-08-18", mood: 3, note: "tenang" })

    expect(chain.maybeSingle).toHaveBeenCalled()
    expect(chain.insert).toHaveBeenCalledWith({
      date: "2026-08-18",
      mood: 3,
      note: "tenang",
      source: "manual",
      session_id: null,
    })
    expect(chain.upsert).not.toHaveBeenCalled()
    expect(from).toHaveBeenCalledWith("mood_entries")
  })

  it("updates the existing manual entry for the day", async () => {
    const { chain } = buildClient({
      rows: [ROW],
      existing: { id: "99999999-9999-9999-9999-999999999999" },
    })
    await upsertMood({ date: "2026-08-18", mood: 2 })

    expect(chain.update).toHaveBeenCalledWith({
      date: "2026-08-18",
      mood: 2,
      note: null,
      source: "manual",
      session_id: null,
    })
    expect(chain.eq).toHaveBeenCalledWith("id", "99999999-9999-9999-9999-999999999999")
    expect(chain.insert).not.toHaveBeenCalled()
  })

  it("defaults source to manual", async () => {
    buildClient({ rows: [ROW], existing: null })
    await upsertMood({ date: "2026-08-18", mood: 3 })

    const { from } = state.client as { from: ReturnType<typeof vi.fn> }
    const chain = from.mock.results[0].value as {
      insert: ReturnType<typeof vi.fn>
    }
    expect(chain.insert).toHaveBeenCalledWith({
      date: "2026-08-18",
      mood: 3,
      note: null,
      source: "manual",
      session_id: null,
    })
  })
})