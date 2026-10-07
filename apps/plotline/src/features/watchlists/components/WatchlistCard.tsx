import Image from 'next/image'
import Link from 'next/link'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { ItemDescription } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { getPosterUrl } from '@/features/media-grid/grid/services/media-display-helpers'
import { cn } from '@/lib/utils'

import type { WatchlistCard as WatchlistCardData, WatchlistCardPreview } from '../types'

import { formatWatchlistTitleCount } from '../services/format-watchlist-title-count'
import { WatchlistVisibilityBadge } from './WatchlistVisibilityBadge'

type WatchlistGridCardProps = {
  card: WatchlistCardData
}

export function WatchlistGridCard({ card }: WatchlistGridCardProps) {
  return (
    <Card>
      <div className="px-(--card-spacing)">
        <WatchlistPosterStack previews={card.previews} />
      </div>
      <CardHeader>
        <Link className="w-fit" href={`/dashboard/watchlists/${card.slug}`}>
          <CardTitle className="line-clamp-2">{card.name}</CardTitle>
        </Link>

        <ShowIf condition={card.description != null}>
          <CardDescription className="line-clamp-3">{card.description}</CardDescription>
        </ShowIf>

        <div className="flex items-center gap-2">
          <WatchlistVisibilityBadge variant="outline" visibility={card.visibility} />
          <ItemDescription className="leading-none">
            {formatWatchlistTitleCount(card.titleCount)}
          </ItemDescription>
        </div>
      </CardHeader>
    </Card>
  )
}

function WatchlistPosterFrame({
  className,
  index,
  preview,
  style,
}: {
  className?: string
  index: number
  preview: null | WatchlistCardPreview
  style?: { zIndex: number }
}) {
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

// Later frames sit on top of earlier ones. No titles still leaves one empty frame.
function WatchlistPosterStack({ previews }: { previews: readonly WatchlistCardPreview[] }) {
  const frames = previews.length > 0 ? previews : [null]

  return (
    <div aria-hidden="true" className="flex items-end">
      {frames.map((preview, index) => (
        <WatchlistPosterFrame
          className={index > 0 ? '-ml-10' : undefined}
          index={index}
          key={index}
          preview={preview}
          style={{ zIndex: index + 1 }}
        />
      ))}
    </div>
  )
}
