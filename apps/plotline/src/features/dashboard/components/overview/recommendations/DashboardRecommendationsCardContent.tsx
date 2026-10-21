import { UseQueryResult } from '@tanstack/react-query'
import Link from 'next/link'

import { MediaPoster } from '@/components/media/MediaPoster'
import { Item, ItemContent, ItemHeader, ItemTitle } from '@/components/ui/item'
import { ItemGroup } from '@/components/ui/item'
import { dashboardTitleHref } from '@/features/dashboard/services/format-dashboard'
import { DashboardRecommendations } from '@/features/dashboard/types'
import { tmdbMediaUrl } from '@/lib/tmdb/tmdb-media-url'

import { DashboardWidgetError } from '../../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../../state/DashboardWidgetSkeleton'

type DashboardRecommendationsCardContentProps = {
  query: UseQueryResult<NoInfer<DashboardRecommendations>, Error>
}

export function DashboardRecommendationsCardContent({
  query,
}: DashboardRecommendationsCardContentProps) {
  const { data, isError, isLoading, refetch } = query

  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-48" />
  }

  if (isError) {
    return <DashboardWidgetError message="Couldn't load recommendations." onRetry={refetch} />
  }

  if (!data || data.items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nothing new to suggest from those titles.</p>
    )
  }

  return (
    <ItemGroup className="flex-row">
      {data.items.map((item) => (
        <Item className="p-0 flex-col items-start w-36" key={`${item.mediaType}-${item.tmdbId}`}>
          <ItemHeader className="basis-auto">
            <Link href={dashboardTitleHref(item.mediaType, item.tmdbId)}>
              <MediaPoster
                alt={item.title}
                className="rounded-sm w-36"
                ratio={2 / 3}
                sizes="144px"
                src={tmdbMediaUrl(item.posterPath, 'w185')}
              />
            </Link>
          </ItemHeader>
          <ItemContent>
            <ItemTitle>{item.title}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
