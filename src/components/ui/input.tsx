import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-[#9DA2B3]/25 bg-[#1E1E24] px-3 py-1 text-base text-[#EDEFF7] placeholder:text-[#9DA2B3] shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-aeonikpro",
        "focus-visible:border-[#9DA2B3]/50 focus-visible:ring-[#9DA2B3]/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500/50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#EDEFF7]",
        // Style number input spinners for dark theme
        "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        "[&[type=number]]:[-moz-appearance:textfield]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
