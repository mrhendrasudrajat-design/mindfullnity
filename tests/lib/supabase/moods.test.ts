import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  client: null as unknown,
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => state.client),
}))

import { listMoods, upsertMood } from "@/lib/supabase/moods"

function buildClient({ rows, error }: { rows?: unknown[]; error?: { message: string } }) {
  const payload = error
    ? { data: null, error }
    : { data: rows, error: null }
  const row = rows?.[0] ?? null

  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.insert = vi.fn(() => chain)
  chain.upsert = vi.fn(() => chain)
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
  it("upserts on the (user_id, date) conflict", async () => {
    const { chain } = buildClient({ rows: [ROW] })
    const entry = await upsertMood({
      date: "2026-08-18",
      mood: 5,
      note: "hebat",
      source: "checkin",
    })

    expect(chain.upsert).toHaveBeenCalledWith(
      {
        date: "2026-08-18",
        mood: 5,
        note: "hebat",
        source: "checkin",
      },
      { onConflict: "user_id,date" },
    )
    expect(chain.single).toHaveBeenCalled()
    expect(entry.mood).toBe(4)
  })

  it("defaults source to manual and note to null", async () => {
    buildClient({ rows: [ROW] })
    await upsertMood({ date: "2026-08-18", mood: 3 })

    const { from } = state.client as { from: ReturnType<typeof vi.fn> }
    const chain = from.mock.results[0].value as {
      upsert: ReturnType<typeof vi.fn>
    }
    expect(chain.upsert).toHaveBeenCalledWith(
      { date: "2026-08-18", mood: 3, note: null, source: "manual" },
      { onConflict: "user_id,date" },
    )
  })
})