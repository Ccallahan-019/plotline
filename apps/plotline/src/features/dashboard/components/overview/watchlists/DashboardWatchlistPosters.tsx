import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { getPosterUrl } from '@/features/media-grid/grid/services/media-display-helpers'
import { WatchlistCardPreview } from '@/features/watchlists/cards/types'
import { cn } from '@/lib/utils'

type DashboardWatchlistPostersProps = {
  previews: readonly WatchlistCardPreview[]
}

export function DashboardWatchlistPosters({ previews }: DashboardWatchlistPostersProps) {
  const frames = previews.length > 0 ? previews : [null]

  return (
    <div className="flex gap-0.5">
      {frames.map((preview, index) => {
        const src = preview ? getPosterUrl(preview.posterPath, 'w185') : undefined

        return (
          <div className="relative shrink-0" key={index}>
            <AspectRatio
              className={cn(
                'w-16 overflow-hidden rounded-md border-2 border-card bg-muted shadow-lg',
                index > 0 && '-ml-1.5',
              )}
              ratio={2 / 3}
            >
              {src ? (
                <Image alt="" className="object-cover" fill sizes="128px" src={src} />
              ) : (
                <Empty className="h-full w-full">
                  <EmptyHeader>
                    <EmptyTitle className="text-xs">No Media</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              )}
            </AspectRatio>
          </div>
        )
      })}
    </div>
  )
}
