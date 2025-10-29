import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-[#9DA2B3]/25 bg-[#1E1E24] px-3 py-2 text-base text-[#EDEFF7] placeholder:text-[#9DA2B3] shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-aeonikpro",
        "focus-visible:border-[#9DA2B3]/50 focus-visible:ring-[#9DA2B3]/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500/50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
