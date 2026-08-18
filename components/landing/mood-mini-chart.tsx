import { cn } from "@/lib/utils"

const LEVELS = [1, 2, 3, 4, 5]

type MoodMiniChartProps = {
  className?: string
}

export function MoodMiniChart({ className }: MoodMiniChartProps) {
  return (
    <svg
      viewBox="0 0 120 40"
      className={cn("h-10 w-full", className)}
      aria-hidden
    >
      {LEVELS.map((level, index) => {
        const cx = 12 + index * 24
        const isActive = level === 3
        return (
          <circle
            key={level}
            cx={cx}
            cy={20}
            r={isActive ? 7 : 5}
            className={isActive ? "fill-primary" : "fill-primary/30"}
          />
        )
      })}
    </svg>
  )
}