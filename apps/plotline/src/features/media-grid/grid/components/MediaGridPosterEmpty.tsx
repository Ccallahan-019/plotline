import { Link2Off } from 'lucide-react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Empty, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import { RatingBadge } from './RatingBadge'

type MediaGridPosterEmptyProps = {
  className?: string
  rating?: number
  ratio: number
}

export function MediaGridPosterEmpty({ className, rating, ratio }: MediaGridPosterEmptyProps) {
  const showRating = rating !== undefined

  return (
    <AspectRatio
      className={cn('w-full relative bg-muted rounded-md overflow-hidden', className)}
      ratio={ratio}
    >
      <ShowIf condition={showRating}>
        <RatingBadge rating={rating} />
      </ShowIf>
      <Empty className="h-full">
        <EmptyMedia variant="icon">
          <Link2Off />
        </EmptyMedia>
        <EmptyTitle>No Media Poster Available</EmptyTitle>
      </Empty>
    </AspectRatio>
  )
}
