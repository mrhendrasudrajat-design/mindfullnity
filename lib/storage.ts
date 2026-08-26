export const STORAGE_KEYS = {
  draft: "mind-draft-v1",
  sessions: "mind-sessions",
  mood: "mind-mood",
  settings: "mind-settings",
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export type Settings = {
  language?: "id" | "en"
  volume?: number
  voice?: boolean
}

type CacheEntry = {
  raw: string | null
  value: unknown
}

const listeners = new Set<() => void>()
const snapshotCache = new Map<StorageKey, CacheEntry>()

export function isStorageKey(value: string | null): value is StorageKey {
  return (
    value !== null &&
    (Object.values(STORAGE_KEYS) as string[]).includes(value)
  )
}

function parseValue<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === null) {
      snapshotCache.clear()
      notifyStorageChange()
      return
    }
    if (isStorageKey(event.key)) {
      snapshotCache.delete(event.key)
      notifyStorageChange()
    }
  })
}

export function subscribeStorage(callback: () => void): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export function notifyStorageChange() {
  for (const listener of listeners) listener()
}

export function readStorage<T>(key: StorageKey, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    return parseValue(window.localStorage.getItem(key), fallback)
  } catch {
    return fallback
  }
}

export function readStorageSnapshot<T>(key: StorageKey, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    const cached = snapshotCache.get(key)
    if (cached && cached.raw === raw) {
      return cached.value === undefined ? fallback : (cached.value as T)
    }
    const value = parseValue(raw, fallback)
    snapshotCache.set(key, { raw, value })
    return value
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: StorageKey, value: T): void {
  if (typeof window === "undefined") return
  try {
    const raw = JSON.stringify(value)
    window.localStorage.setItem(key, raw)
    snapshotCache.set(key, { raw, value })
    notifyStorageChange()
  } catch {
    // storage unavailable or full — ignore
  }
}

export function removeStorage(key: StorageKey): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key)
    snapshotCache.delete(key)
    notifyStorageChange()
  } catch {
    // storage unavailable — ignore
  }
}

export function readSettings(): Settings {
  return readStorage<Settings>(STORAGE_KEYS.settings, {})
}

export function writeSettings(patch: Partial<Settings>): void {
  writeStorage(STORAGE_KEYS.settings, { ...readSettings(), ...patch })
}
