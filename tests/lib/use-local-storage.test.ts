import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { STORAGE_KEYS } from "@/lib/storage"
import { useLocalStorage } from "@/lib/use-local-storage"

type Draft = { step: number }

describe("useLocalStorage", () => {
  it("starts with the initial value when nothing is stored", () => {
    const { result } = renderHook(() =>
      useLocalStorage<Draft | null>(STORAGE_KEYS.draft, null),
    )
    expect(result.current[0]).toBeNull()
  })

  it("reads an existing stored value on mount", () => {
    window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify({ step: 3 }))
    const { result } = renderHook(() =>
      useLocalStorage<Draft | null>(STORAGE_KEYS.draft, null),
    )
    expect(result.current[0]).toEqual({ step: 3 })
  })

  it("setValue persists and re-renders with the new value", () => {
    const { result } = renderHook(() =>
      useLocalStorage<Draft | null>(STORAGE_KEYS.draft, null),
    )
    act(() => result.current[1]({ step: 2 }))
    expect(result.current[0]).toEqual({ step: 2 })
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.draft) ?? "{}")).toEqual({
      step: 2,
    })
  })

  it("supports an updater function", () => {
    const { result } = renderHook(() =>
      useLocalStorage<number[]>(STORAGE_KEYS.mood, []),
    )
    act(() => result.current[1]((current) => [...current, 4]))
    act(() => result.current[1]((current) => [...current, 5]))
    expect(result.current[0]).toEqual([4, 5])
  })

  it("resetValue clears the stored value and restores the initial", () => {
    const { result } = renderHook(() =>
      useLocalStorage<Draft | null>(STORAGE_KEYS.draft, null),
    )
    act(() => result.current[1]({ step: 1 }))
    act(() => result.current[2]())
    expect(result.current[0]).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEYS.draft)).toBeNull()
  })

  it("re-renders other hooks watching the same key", () => {
    const first = renderHook(() => useLocalStorage<number | null>(STORAGE_KEYS.draft, null))
    const second = renderHook(() => useLocalStorage<number | null>(STORAGE_KEYS.draft, null))
    act(() => first.result.current[1](5))
    expect(second.result.current[0]).toBe(5)
  })
})
