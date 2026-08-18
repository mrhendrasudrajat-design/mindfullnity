import React from "react"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

class IntersectionObserverMock {
  readonly root: Element | null = null
  readonly rootMargin: string = ""
  readonly thresholds: ReadonlyArray<number> = []

  constructor(
    private readonly callback: IntersectionObserverCallback,
  ) {}

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock)

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock)

vi.mock("next/dynamic", async () => {
  const { lazy } = await import("react")
  return {
    __esModule: true,
    default: (loader: () => Promise<unknown>) =>
      lazy(() =>
        loader().then((mod) => {
          const hasDefault =
            typeof mod === "object" && mod !== null && "default" in mod
          return {
            default: (
              hasDefault
                ? (mod as { default: React.ComponentType }).default
                : mod
            ) as React.ComponentType,
          }
        }),
      ),
  }
})

vi.mock("recharts", async () => {
  const React = await import("react")
  return {
    Bar: () => React.createElement("rect", { "data-testid": "recharts-bar" }),
    BarChart: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "recharts-bar-chart" }, children),
    CartesianGrid: () => null,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "recharts-responsive-container" }, children),
  }
})

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    width,
    height,
    sizes,
    ...rest
  }: {
    src: string | { src: string }
    alt: string
    className?: string
    width?: number
    height?: number
    sizes?: string
  }) => {
    const resolved = typeof src === "string" ? src : src.src
    return React.createElement("img", {
      src: resolved,
      alt,
      className,
      width,
      height,
      sizes,
      ...rest,
    })
  },
}))