import { UseQueryResult } from '@tanstack/react-query'

import { WatchlistCard } from '@/features/watchlists/cards/types'

import { DashboardWidgetEmpty } from '../../state/DashboardWidgetEmpty'
import { DashboardWidgetError } from '../../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../../state/DashboardWidgetSkeleton'
import { DashboardWatchlistRows } from './DashboardWatchlistRows'

const WATCHLIST_PREVIEW_LIMIT = 4

type DashboardWatchlistsContentProps = {
  query: UseQueryResult<NoInfer<WatchlistCard[]>, Error>
}

export function DashboardWatchlistsContent({ query }: DashboardWatchlistsContentProps) {
  const { data, isError, isLoading, refetch } = query

  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-40" />
  }

  if (isError) {
    const handleRetry = () => {
      void refetch()
    }

    return <DashboardWidgetError message="Couldn't load watchlists." onRetry={handleRetry} />
  }

  if (!data || data.length === 0) {
    return (
      <DashboardWidgetEmpty
        description="You don't have any watchlists yet."
        title="No Watchlists Found"
      />
    )
  }

  const cards = data.slice(0, WATCHLIST_PREVIEW_LIMIT)

  return <DashboardWatchlistRows cards={cards} />
}
