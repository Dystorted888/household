import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
        destructive:
          "bg-error text-error-foreground hover:bg-error/90 shadow-lg hover:shadow-xl",
        outline:
          "border-2 border-outline bg-surface hover:bg-surface-variant hover:border-primary/50 text-on-surface shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 shadow-md hover:shadow-lg",
        ghost: "hover:bg-surface-variant hover:text-on-surface-variant text-on-surface",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
        elevated: "bg-surface text-on-surface shadow-lg hover:shadow-xl hover:bg-surface-variant",
        filled: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
        tonal: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 shadow-md hover:shadow-lg",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4 py-2 text-xs",
        lg: "h-14 rounded-xl px-8 py-4 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
