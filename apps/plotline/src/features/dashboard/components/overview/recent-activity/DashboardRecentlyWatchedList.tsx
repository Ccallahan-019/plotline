import { Fragment } from 'react/jsx-runtime'

import { ItemGroup, ItemSeparator } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { useDashboardActivity } from '@/features/dashboard/hooks/use-dashboard-activity'

import { DashboardWidgetEmpty } from '../../state/DashboardWidgetEmpty'
import { DashboardWidgetError } from '../../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../../state/DashboardWidgetSkeleton'
import { DashboardRecentlyWatchedRow } from './DashboardRecentlyWatchedRow'

const RECENTLY_WATCHED_LIMIT = 4

type DashboardRecentlyWatchedListProps = {
  timeZone: string
}

export function DashboardRecentlyWatchedList({ timeZone }: DashboardRecentlyWatchedListProps) {
  // All time, so the four newest watches are not cut off at 30 days.
  const { data, isError, isPending, refetch } = useDashboardActivity({
    kind: 'watched',
    limit: RECENTLY_WATCHED_LIMIT,
    range: 'all',
    timeZone,
  })

  if (isPending) {
    return <DashboardWidgetSkeleton className="h-40" />
  }

  if (isError) {
    const handleRetry = () => {
      void refetch()
    }

    return (
      <DashboardWidgetError
        message="Couldn't load recently watched titles."
        onRetry={handleRetry}
      />
    )
  }

  if (!data || data.pages[0] == null || data.pages[0].rows.length === 0) {
    return (
      <DashboardWidgetEmpty
        description="Nothing watched yet. Log a watch to see it here."
        title="No Recently Watched Titles"
      />
    )
  }

  const rows = data.pages[0].rows.slice(0, RECENTLY_WATCHED_LIMIT) ?? []

  return (
    <ItemGroup className="gap-2">
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          <DashboardRecentlyWatchedRow row={row} />
          <ShowIf condition={index !== rows.length - 1}>
            <ItemSeparator />
          </ShowIf>
        </Fragment>
      ))}
    </ItemGroup>
  )
}
