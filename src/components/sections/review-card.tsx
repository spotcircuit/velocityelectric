import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getInitials } from '@/lib/utils'

interface ReviewCardProps {
  name: string
  rating: number
  text: string
  location?: string | null
}

export function ReviewCard({ name, rating, text, location }: ReviewCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        {/* Quote Icon */}
        <Quote className="h-8 w-8 text-accent-soft mb-4" />

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Review Text */}
        <p className="text-text mb-6 line-clamp-4">{text}</p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent-soft flex items-center justify-center">
            <span className="text-accent font-semibold text-sm">
              {getInitials(name)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-primary">{name}</p>
            {location && (
              <p className="text-sm text-muted">{location}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
