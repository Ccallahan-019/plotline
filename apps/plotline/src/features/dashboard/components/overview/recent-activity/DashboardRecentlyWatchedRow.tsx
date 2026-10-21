import Link from 'next/link'

import { MediaPoster } from '@/components/media/MediaPoster'
import { RatingStars } from '@/components/ratings/RatingStars'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { useEpisodeTitle } from '@/features/dashboard/hooks/use-episode-title'
import {
  watchedEpisodeLookup,
  type WatchedEpisodeLookup,
} from '@/features/dashboard/services/episode-title'
import { DashboardActivityRow } from '@/features/dashboard/types'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'
import { cn } from '@/lib/utils'

const WATCHED_LABEL = 'Watched'

type DashboardRecentlyWatchedRowProps = {
  row: DashboardActivityRow
}

export function DashboardRecentlyWatchedRow({ row }: DashboardRecentlyWatchedRowProps) {
  const ratingText = row.rating != null ? `${row.rating.toFixed(1)} / 10` : 'Not Rated'
  const hasRating = row.rating != null
  const episodeLookup = watchedEpisodeLookup(row)

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

        <EpisodeDetail detail={row.detail} lookup={episodeLookup} mediaType={row.mediaType} />
      </ItemContent>
      <ItemActions>
        <RowTrailing hasRating={hasRating} ratingText={ratingText} row={row} />
      </ItemActions>
    </Item>
  )
}

function EpisodeDetail({
  detail,
  lookup,
  mediaType,
}: {
  detail: null | string
  lookup: null | WatchedEpisodeLookup
  mediaType: 'movie' | 'tv' | null
}) {
  const mediaTypeText = mediaType === 'movie' ? 'Film' : 'Series'

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-start gap-x-2 gap-y-0.5">
        <ItemDescription>{mediaTypeText}</ItemDescription>
        <ShowIf condition={detail != null}>
          <ItemDescription className="text-foreground text-nowrap">{detail}</ItemDescription>
        </ShowIf>
      </div>
      <ShowIf condition={lookup != null}>
        <RecentlyWatchedEpisodeTitle lookup={lookup} />
      </ShowIf>
    </div>
  )
}

function RecentlyWatchedEpisodeTitle({ lookup }: { lookup: null | WatchedEpisodeLookup }) {
  const title = useEpisodeTitle(lookup)

  if (title == null) {
    return null
  }

  return <ItemDescription className="text-nowrap">{title}</ItemDescription>
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

// Dropped and on-hold events stay in the watched feed, so they show their status in place of a rating.
function RowTrailing({
  hasRating,
  ratingText,
  row,
}: {
  hasRating: boolean
  ratingText: string
  row: DashboardActivityRow
}) {
  if (row.label !== WATCHED_LABEL) {
    return <Badge variant="secondary">{row.label}</Badge>
  }

  return (
    <div className="flex items-center gap-2">
      {/* Stand in for inline ratings until ratings are implemented */}
      <RatingStars ratingOutOfTen={row.rating ?? 0} />
      <span className={cn(hasRating ? 'text-foreground text-sm' : 'text-muted-foreground text-xs')}>
        {ratingText}
      </span>
    </div>
  )
}
