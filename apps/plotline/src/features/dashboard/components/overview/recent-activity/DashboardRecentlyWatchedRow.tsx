import Link from 'next/link'

import { MediaPoster } from '@/components/media/MediaPoster'
import { RatingStars } from '@/components/ratings/RatingStars'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { DashboardActivityRow } from '@/features/dashboard/types'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'
import { cn } from '@/lib/utils'

type DashboardRecentlyWatchedRowProps = {
  row: DashboardActivityRow
}

export function DashboardRecentlyWatchedRow({ row }: DashboardRecentlyWatchedRowProps) {
  const mediaType = row.mediaType === 'movie' ? 'Film' : 'Series'
  const ratingText = row.rating != null ? `${row.rating.toFixed(1)} / 10` : 'Not Rated'
  const hasRating = row.rating != null

  return (
    <Item className="p-0">
      <ItemMedia>
        <MediaPoster
          alt=""
          className="w-16 rounded-sm"
          ratio={2 / 3}
          sizes="64px"
          src={tmdbMediaUrl(row.posterPath, 'w185')}
        />
      </ItemMedia>
      <ItemContent>
        <RowTitle href={row.href} title={row.title} />
        <div className="flex flex-wrap gap-2 items-center">
          <ItemDescription>{mediaType}</ItemDescription>
          <ShowIf condition={row.detail != null}>
            <ItemDescription className="text-foreground">{row.detail}</ItemDescription>
          </ShowIf>
        </div>
      </ItemContent>
      <ShowIf condition={row.filterKind === 'watched'}>
        <ItemActions>
          <div className="flex items-center gap-2">
            {/* Stand in for inline ratings until ratings are implemented */}
            <RatingStars ratingOutOfTen={row.rating ?? 0} />
            <span
              className={cn(
                hasRating ? 'text-foreground text-sm' : 'text-muted-foreground text-xs',
              )}
            >
              {ratingText}
            </span>
          </div>
        </ItemActions>
      </ShowIf>
    </Item>
  )
}

function RowTitle({ href, title }: { href: null | string; title: string }) {
  if (href == null) {
    return <ItemTitle className="text-base">{title}</ItemTitle>
  }

  return (
    <Link href={href}>
      <ItemTitle className="text-base">{title}</ItemTitle>
    </Link>
  )
}
