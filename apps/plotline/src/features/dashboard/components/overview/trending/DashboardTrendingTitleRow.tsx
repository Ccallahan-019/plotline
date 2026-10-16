import Link from 'next/link'

import { MediaBackdropCard } from '@/components/media/MediaBackdropCard'
import { MediaPoster } from '@/components/media/MediaPoster'
import { RatingBadge } from '@/components/ratings/RatingsBadge'
import { CardAction, CardHeader } from '@/components/ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { dashboardTitleHref } from '@/features/dashboard/services/format-dashboard'
import { TrendingTitle } from '@/features/dashboard/types'
import { titleBackdropUrl } from '@/features/media-detail/services/media-image-url'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

type DashboardTrendingTitleRowProps = {
  item: TrendingTitle
}

export function DashboardTrendingTitleRow({ item }: DashboardTrendingTitleRowProps) {
  const { backdropPath, mediaType, overview, posterPath, releaseYear, title, tmdbId, voteAverage } =
    item

  const backdropUrl = titleBackdropUrl(backdropPath)
  const href = dashboardTitleHref(mediaType, tmdbId)
  const src = tmdbMediaUrl(posterPath, 'w185')

  return (
    <MediaBackdropCard
      backdropUrl={backdropUrl}
      imageSizes="280px"
      size="sm"
      wrapperClassName="lg:max-xl:w-1/3"
    >
      <CardHeader>
        <Item className="min-w-0 p-0">
          <ItemMedia>
            <Link href={href}>
              <MediaPoster
                alt={title}
                className="rounded-sm w-12"
                ratio={2 / 3}
                sizes="64px"
                src={src}
              />
            </Link>
          </ItemMedia>
          <ItemContent className="min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <ItemTitle className="min-w-0 line-clamp-1 truncate">{title}</ItemTitle>
              <ShowIf condition={releaseYear != null}>
                <span className="shrink-0 text-xs text-muted-foreground">{releaseYear}</span>
              </ShowIf>
            </div>
            <ShowIf condition={overview != null}>
              <ItemDescription className="line-clamp-2">{overview}</ItemDescription>
            </ShowIf>
          </ItemContent>
        </Item>
        <ShowIf condition={voteAverage != null}>
          <CardAction>
            <RatingBadge className="static" rating={voteAverage} />
          </CardAction>
        </ShowIf>
      </CardHeader>
    </MediaBackdropCard>
  )
}
