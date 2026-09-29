import { cn } from "@/lib/utils"

export function DokuLogo({ className, title = "DOKU" }: { className?: string; title?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-[#ED1C24] px-2 py-1 text-xs font-bold tracking-tight text-white",
        className,
      )}
      title={title}
    >
      <span className="grid size-3 place-items-center rounded-sm bg-white text-[8px] font-black leading-none text-[#ED1C24]">D</span>
      DOKU
    </span>
  )
}
