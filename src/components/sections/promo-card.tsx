import { Tag, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PromoCardProps {
  title: string
  description: string
  code?: string | null
  expiresAt?: Date | null
}

export function PromoCard({ title, description, code, expiresAt }: PromoCardProps) {
  const isExpired = expiresAt && new Date(expiresAt) < new Date()
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card className={`h-full border-2 ${isExpired ? 'border-gray-200 opacity-60' : 'border-accent'}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="p-3 bg-accent-soft rounded-xl">
            <Tag className="h-6 w-6 text-accent" />
          </div>
          {code && !isExpired && (
            <Badge variant="success">
              Code: {code}
            </Badge>
          )}
          {isExpired && (
            <Badge variant="secondary">Expired</Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
        <p className="text-muted mb-4">{description}</p>

        {expiresAt && !isExpired && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar className="h-4 w-4" />
            <span>Expires: {formatDate(expiresAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
