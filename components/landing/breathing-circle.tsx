import { cn } from "@/lib/utils"

type BreathingCircleProps = {
  label: string
  className?: string
}

const RINGS = [
  { inset: "inset-0", delay: "0s" },
  { inset: "inset-[11%]", delay: "2.5s" },
  { inset: "inset-[22%]", delay: "5s" },
]

export function BreathingCircle({ label, className }: BreathingCircleProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative aspect-square w-full max-w-[26rem] mx-auto",
        className,
      )}
    >
      {RINGS.map((ring) => (
        <div
          key={ring.inset}
          aria-hidden
          style={{ animationDelay: ring.delay }}
          className={cn(
            "absolute rounded-full border border-primary/20",
            ring.inset,
            "motion-safe:animate-breath",
          )}
        />
      ))}
      <div
        aria-hidden
        className="absolute inset-[44%] rounded-full border border-primary/40 bg-primary/10"
      />
      <div
        aria-hidden
        className="absolute inset-[51%] rounded-full bg-primary"
      />
    </div>
  )
}