import Link from 'next/link'
import { ArrowRight, LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  slug: string
  title: string
  excerpt: string
  iconName: string
  className?: string
}

export function ServiceCard({ slug, title, excerpt, iconName, className }: ServiceCardProps) {
  // Dynamically get the icon from lucide-react
  const Icon = (Icons[iconName as keyof typeof Icons] as LucideIcon) || Icons.Zap

  return (
    <Link href={`/services/${slug}`}>
      <Card className={cn('h-full group cursor-pointer', className)}>
        <CardContent className="p-6">
          <div className="p-3 bg-accent-soft rounded-xl w-fit mb-4 group-hover:bg-accent transition-colors">
            <Icon className="h-6 w-6 text-accent group-hover:text-white transition-colors" />
          </div>

          <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
            {title}
          </h3>

          <p className="text-muted mb-4 line-clamp-2">{excerpt}</p>

          <div className="flex items-center gap-2 text-accent font-medium">
            <span>Learn More</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
