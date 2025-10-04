import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-destructive/30",
        outline: "border border-border/50 bg-transparent hover:bg-muted/50 hover:border-primary/50 text-foreground shadow-sm",
        secondary: "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground shadow-sm",
        ghost: "hover:bg-muted/50 hover:text-foreground text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline text-foreground",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-lg hover:shadow-success/30",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-lg hover:shadow-warning/30",
      },
      size: {
        default: "h-11 px-6 py-2.5 rounded-xl",
        sm: "h-9 px-4 py-2 rounded-lg text-sm",
        lg: "h-13 px-8 py-3 rounded-xl text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
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
