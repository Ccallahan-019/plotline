import { useContinueWatchingRows } from '@/features/dashboard/hooks/use-continue-watching-items'
import { selectUpNextItems } from '@/features/dashboard/services/up-next'
import { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { DashboardWidgetEmpty } from '../../state/DashboardWidgetEmpty'
import { DashboardWidgetError } from '../../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../../state/DashboardWidgetSkeleton'
import { DashboardUpNextPosters } from './DashboardUpNextPosters'

type DashboardUpNextContentProps = {
  initialData?: LibraryItemsResponse
}

export function DashboardUpNextContent({ initialData }: DashboardUpNextContentProps) {
  const { libraryItems, query, rows } = useContinueWatchingRows({ initialData })
  const { isError, isLoading, refetch } = query

  const posters = selectUpNextItems(rows)

  const handleRetry = () => {
    void refetch()
  }

  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-36" />
  }

  if (isError) {
    return (
      <DashboardWidgetError message="Couldn't load what you're watching." onRetry={handleRetry} />
    )
  }

  if (!posters.length) {
    return (
      <DashboardWidgetEmpty
        description="You have no titles currently in progress."
        title="Nothing in Progress"
      />
    )
  }

  return <DashboardUpNextPosters libraryItems={libraryItems} posters={posters} />
}
