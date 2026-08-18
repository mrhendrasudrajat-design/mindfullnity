import { describe, expect, it } from "vitest"

import {
  isStorageKey,
  readSettings,
  readStorage,
  readStorageSnapshot,
  removeStorage,
  STORAGE_KEYS,
  writeSettings,
  writeStorage,
} from "@/lib/storage"

describe("readStorage / writeStorage", () => {
  it("returns the fallback when nothing is stored", () => {
    expect(readStorage(STORAGE_KEYS.mood, [])).toEqual([])
    expect(readStorage(STORAGE_KEYS.sessions, null)).toBeNull()
  })

  it("round-trips a value through localStorage", () => {
    const value = { date: "2026-08-18", mood: 4 }
    writeStorage(STORAGE_KEYS.mood, value)
    expect(readStorage(STORAGE_KEYS.mood, [])).toEqual(value)
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.mood) ?? "{}")).toEqual(value)
  })

  it("falls back when stored JSON is corrupt", () => {
    window.localStorage.setItem(STORAGE_KEYS.settings, "{not-json")
    expect(readStorage(STORAGE_KEYS.settings, {})).toEqual({})
  })

  it("is safe when window is unavailable", () => {
    const originalWindow = globalThis.window
    Object.defineProperty(globalThis, "window", { value: undefined, configurable: true })
    try {
      expect(readStorage(STORAGE_KEYS.sessions, [])).toEqual([])
      expect(writeStorage(STORAGE_KEYS.sessions, [])).toBeUndefined()
      expect(removeStorage(STORAGE_KEYS.sessions)).toBeUndefined()
    } finally {
      Object.defineProperty(globalThis, "window", { value: originalWindow, configurable: true })
    }
  })
})

describe("readStorageSnapshot", () => {
  it("returns the same reference for repeated reads", () => {
    writeStorage(STORAGE_KEYS.sessions, [{ id: "a" }])
    const first = readStorageSnapshot(STORAGE_KEYS.sessions, [])
    const second = readStorageSnapshot(STORAGE_KEYS.sessions, [])
    expect(first).toBe(second)
  })

  it("returns the fallback after removal", () => {
    removeStorage(STORAGE_KEYS.sessions)
    expect(readStorageSnapshot(STORAGE_KEYS.sessions, [])).toEqual([])
  })
})

describe("removeStorage", () => {
  it("clears the stored value and the snapshot cache", () => {
    writeStorage(STORAGE_KEYS.draft, { step: 2 })
    removeStorage(STORAGE_KEYS.draft)
    expect(window.localStorage.getItem(STORAGE_KEYS.draft)).toBeNull()
    expect(readStorage(STORAGE_KEYS.draft, null)).toBeNull()
  })
})

describe("settings helpers", () => {
  it("returns an empty settings object by default", () => {
    expect(readSettings()).toEqual({})
  })

  it("merges patches into existing settings", () => {
    writeSettings({ language: "en" })
    writeSettings({ volume: 0.6 })
    expect(readSettings()).toEqual({ language: "en", volume: 0.6 })
  })
})

describe("isStorageKey", () => {
  it("accepts only known storage keys", () => {
    expect(isStorageKey("mind-sessions")).toBe(true)
    expect(isStorageKey("mind-draft-v1")).toBe(true)
    expect(isStorageKey("unknown-key")).toBe(false)
    expect(isStorageKey(null)).toBe(false)
  })
})
