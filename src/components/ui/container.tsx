import * as React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg' | 'full'
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizes = {
      sm: 'max-w-4xl',
      default: 'max-w-7xl',
      lg: 'max-w-screen-2xl',
      full: 'max-w-full',
    }

    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}
        {...props}
      />
    )
  }
)
Container.displayName = 'Container'

export { Container }
