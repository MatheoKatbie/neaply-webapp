import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-aeonikpro transition-colors focus:outline-none focus:ring-2 focus:ring-[#9DA2B3]/20 focus:ring-offset-0",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-blue-500 text-white",
                secondary:
                    "border-transparent bg-[#40424D]/50 text-[#EDEFF7]",
                destructive:
                    "border-transparent bg-red-500/20 text-red-400",
                outline: "text-[#EDEFF7] bg-transparent border-[#9DA2B3]/25",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
