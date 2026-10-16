import { Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type RatingBadgeProps = {
  className?: string
  rating?: null | number
}

export function RatingBadge({ className, rating }: RatingBadgeProps) {
  if (rating == null) return null

  return (
    <Badge className={cn('absolute top-1 right-1 z-10', className)} variant="secondary">
      <Star className="text-yellow-500" data-icon="inline-start" fill="currentColor" />

      {rating.toFixed(1)}
    </Badge>
  )
}
