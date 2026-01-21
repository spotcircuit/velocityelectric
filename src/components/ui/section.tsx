import * as React from 'react'
import { cn } from '@/lib/utils'
import { Container } from './container'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  containerSize?: 'default' | 'sm' | 'lg' | 'full'
  background?: 'default' | 'surface' | 'primary' | 'accent'
  padding?: 'default' | 'sm' | 'lg' | 'none'
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      containerSize = 'default',
      background = 'default',
      padding = 'default',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const backgroundStyles = {
      default: { backgroundColor: '#FFFFFF' },
      surface: { backgroundColor: '#F6F8FB' },
      primary: { backgroundColor: '#0B1F3B', color: '#FFFFFF' },
      accent: { backgroundColor: '#EAF3FF' },
    }

    const paddings = {
      none: '',
      sm: 'py-8 md:py-12',
      default: 'py-12 md:py-16 lg:py-20',
      lg: 'py-16 md:py-24 lg:py-32',
    }

    return (
      <section
        ref={ref}
        className={cn(paddings[padding], className)}
        style={{ ...backgroundStyles[background], ...style }}
        {...props}
      >
        <Container size={containerSize}>{children}</Container>
      </section>
    )
  }
)
Section.displayName = 'Section'

export { Section }
