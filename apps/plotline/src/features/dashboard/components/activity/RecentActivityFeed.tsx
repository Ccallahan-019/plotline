import type { DashboardActivityRow } from '@/features/dashboard/types'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ShowIf } from '@/components/utils/ShowIf'
import { useRecentActivityFeed } from '@/features/dashboard/hooks/use-recent-activity-feed'
import { isDefaultActivityFeedFilter } from '@/features/dashboard/services/query-keys'

import { DashboardWidgetError } from '../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../state/DashboardWidgetSkeleton'
import { ActivityFilters } from './ActivityFilters'
import { ActivityTimeline } from './ActivityTimeline'
import { RecentActivityEmpty } from './RecentActivityEmpty'

type RecentActivityFeedProps = {
  timeZone: string
}

export function RecentActivityFeed({ timeZone }: RecentActivityFeedProps) {
  const {
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    isLoading,
    kind,
    mediaType,
    range,
    refetch,
    rows,
    setKind,
    setMediaType,
    setRange,
  } = useRecentActivityFeed(timeZone)

  function handleRetry() {
    void refetch()
  }

  function handleFetchNextPage() {
    void fetchNextPage()
  }

  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-80" />
  }

  if (isError) {
    return <DashboardWidgetError message="Couldn't load recent activity." onRetry={handleRetry} />
  }

  if (rows == null) {
    return <RecentActivityEmpty />
  }

  const isUnfilteredEmpty =
    rows.length === 0 && isDefaultActivityFeedFilter({ kind, mediaType, range })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActivityFilters
          kind={kind}
          mediaType={mediaType}
          onKindChange={setKind}
          onMediaTypeChange={setMediaType}
          onRangeChange={setRange}
          range={range}
        />
        <ShowIf condition={isFetching && !isFetchingNextPage}>
          <Spinner className="size-3.5 text-muted-foreground" />
        </ShowIf>
      </div>

      <ActivityResults isUnfilteredEmpty={isUnfilteredEmpty} rows={rows} timeZone={timeZone} />

      <ShowIf condition={isFetchNextPageError}>
        <DashboardWidgetError
          message="Couldn't load older activity."
          onRetry={handleFetchNextPage}
        />
      </ShowIf>

      <ShowIf condition={hasNextPage}>
        <Button
          disabled={isFetchingNextPage}
          onClick={handleFetchNextPage}
          type="button"
          variant="outline"
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </Button>
      </ShowIf>
    </div>
  )
}

function ActivityResults({
  isUnfilteredEmpty,
  rows,
  timeZone,
}: {
  isUnfilteredEmpty: boolean
  rows: readonly DashboardActivityRow[]
  timeZone: string
}) {
  if (isUnfilteredEmpty) {
    return <RecentActivityEmpty />
  }

  return (
    <ActivityTimeline emptyLabel="Nothing matches these filters." rows={rows} timeZone={timeZone} />
  )
}
