import type { InputHTMLAttributes } from "react"

type FormFieldProps = {
  label: string
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function FormField({ label, inputProps }: FormFieldProps) {
  const { id, ...rest } = inputProps
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40"
      />
    </div>
  )
}
