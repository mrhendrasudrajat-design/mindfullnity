"use client"

import { useCallback, useSyncExternalStore } from "react"

import {
  readStorageSnapshot,
  removeStorage,
  subscribeStorage,
  writeStorage,
  type StorageKey,
} from "@/lib/storage"

export function useLocalStorage<T>(key: StorageKey, initialValue: T) {
  const value = useSyncExternalStore(
    subscribeStorage,
    () => readStorageSnapshot(key, initialValue),
    () => initialValue,
  )

  const setValue = useCallback(
    (next: T | ((current: T) => T)) => {
      writeStorage(
        key,
        typeof next === "function" ? (next as (c: T) => T)(value) : next,
      )
    },
    [key, value],
  )

  const resetValue = useCallback(() => {
    removeStorage(key)
  }, [key])

  return [value, setValue, resetValue] as const
}
