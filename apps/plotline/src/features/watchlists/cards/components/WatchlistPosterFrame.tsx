import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { getPosterUrl } from '@/features/media-grid/grid/services/media-display-helpers'
import { cn } from '@/lib/utils'

import { WatchlistCardPreview } from '../types'

type WatchlistPosterFrameProps = {
  className?: string
  index: number
  preview: null | WatchlistCardPreview
  style?: { zIndex: number }
}

export function WatchlistPosterFrame({
  className,
  index,
  preview,
  style,
}: WatchlistPosterFrameProps) {
  const posterUrl = preview ? getPosterUrl(preview.posterPath) : undefined

  const widthClasses = {
    0: 'w-32',
    1: 'w-28',
    2: 'w-24',
  }

  return (
    <div className={cn('relative shrink-0', className)} style={style}>
      <AspectRatio
        className={cn(
          'overflow-hidden rounded-md border-2 border-card bg-muted shadow-md',
          widthClasses[index as keyof typeof widthClasses],
        )}
        ratio={2 / 3}
      >
        {posterUrl ? (
          <Image alt="" className="object-cover" fill sizes="128px" src={posterUrl} />
        ) : (
          <Empty className="h-full w-full">
            <EmptyHeader>
              <EmptyTitle>No Media</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </AspectRatio>
    </div>
  )
}
