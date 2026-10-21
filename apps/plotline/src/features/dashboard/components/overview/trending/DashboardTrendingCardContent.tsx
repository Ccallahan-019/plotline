import { UseQueryResult } from '@tanstack/react-query'

import { TrendingTitles } from '@/features/dashboard/types'

import { DashboardWidgetError } from '../../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../../state/DashboardWidgetSkeleton'
import { DashboardTrendingCardEmpty } from './DashboardTrendingCardEmpty'
import { DashboardTrendingTitleRow } from './DashboardTrendingTitleRow'

type DashboardTrendingCardContentProps = {
  query: UseQueryResult<NoInfer<TrendingTitles>, Error>
}

export function DashboardTrendingCardContent({ query }: DashboardTrendingCardContentProps) {
  const { data, isError, isLoading } = query

  function handleRetry() {
    void query.refetch()
  }

  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-48" />
  }

  if (isError) {
    return <DashboardWidgetError message="Couldn't load trending titles." onRetry={handleRetry} />
  }

  if (!data || data.items.length === 0) {
    return <DashboardTrendingCardEmpty />
  }

  return (
    <div className="flex flex-col gap-2">
      {data.items.map((item) => (
        <DashboardTrendingTitleRow item={item} key={`${item.mediaType}-${item.tmdbId}`} />
      ))}
    </div>
  )
}
