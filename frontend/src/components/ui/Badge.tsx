import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-indigo/10 text-brand-indigo hover:bg-brand-indigo/20",
        secondary:
          "border-transparent bg-brand-gray text-brand-navy hover:bg-brand-gray/80",
        outline: "text-brand-navy border-brand-gray",
        success:
          "border-transparent bg-semantic-success/15 text-semantic-success hover:bg-semantic-success/25",
        warning:
          "border-transparent bg-semantic-warning/15 text-semantic-warning hover:bg-semantic-warning/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
