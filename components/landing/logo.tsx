import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="relative grid size-8 shrink-0 place-items-center rounded-full bg-primary/10"
      >
        <span className="size-3.5 rounded-full border-[1.5px] border-primary" />
        <span className="absolute size-1.5 rounded-full bg-primary" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        Mindfulnity
      </span>
    </span>
  )
}