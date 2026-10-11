import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

type MediaTitleYourRatingProps = {
  className?: string
}

export function MediaTitleYourRating({ className }: MediaTitleYourRatingProps) {
  return (
    <div className={cn('flex items-center gap-4 justify-between', className)}>
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Your rating
      </p>
      <div className="flex items-center gap-3">
        <div aria-hidden className="flex gap-1 text-muted-foreground">
          {Array.from({ length: 5 }, (_, index) => (
            <Star className="size-5" key={index} />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">Rate</span>
      </div>
    </div>
  )
}
