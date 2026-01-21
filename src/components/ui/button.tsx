'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tap-highlight-none',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent',
        secondary:
          'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white focus-visible:ring-primary',
        outline:
          'border-2 border-current bg-transparent hover:bg-white/10 focus-visible:ring-white',
        call: 'bg-success text-white hover:bg-green-700 focus-visible:ring-success',
        danger: 'bg-danger text-white hover:bg-red-700 focus-visible:ring-danger',
        ghost: 'hover:bg-surface text-text focus-visible:ring-accent',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2 text-sm',
        lg: 'h-14 px-8 py-4 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
