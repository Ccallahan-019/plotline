import { Button } from '@/components/ui/button'
import { ShowIf } from '@/components/utils/ShowIf'

import { isDefaultActivityFeedFilter } from '../../services/query-keys'
import {
  DashboardActivityKind,
  DashboardActivityMediaType,
  DashboardActivityRow,
} from '../../types'
import { DashboardWidgetError } from '../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../state/DashboardWidgetSkeleton'
import { RecentActivityEmpty } from './RecentActivityEmpty'
import { RecentActivityResults } from './RecentActivityResults'

type RecentActivityFeedContentProps = {
  hasNextPage: boolean
  isError: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  isLoading: boolean
  kind: DashboardActivityKind
  mediaType: DashboardActivityMediaType
  onFetchNextPage: () => void
  onRetry: () => void
  range: string
  rows: null | readonly DashboardActivityRow[]
  timeZone: string
}

export function RecentActivityFeedContent({
  hasNextPage,
  isError,
  isFetchingNextPage,
  isFetchNextPageError,
  isLoading,
  kind,
  mediaType,
  onFetchNextPage,
  onRetry,
  range,
  rows,
  timeZone,
}: RecentActivityFeedContentProps) {
  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-80" />
  }

  if (isError) {
    return <DashboardWidgetError message="Couldn't load recent activity." onRetry={onRetry} />
  }

  if (rows == null) {
    return <RecentActivityEmpty />
  }

  const isUnfilteredEmpty =
    rows.length === 0 && isDefaultActivityFeedFilter({ kind, mediaType, range })

  return (
    <>
      <RecentActivityResults
        isUnfilteredEmpty={isUnfilteredEmpty}
        rows={rows}
        timeZone={timeZone}
      />

      <ShowIf condition={isFetchNextPageError}>
        <DashboardWidgetError message="Couldn't load older activity." onRetry={onFetchNextPage} />
      </ShowIf>

      <ShowIf condition={hasNextPage}>
        <div className="flex justify-center">
          <Button
            disabled={isFetchingNextPage}
            onClick={onFetchNextPage}
            type="button"
            variant="outline"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load Older Activity'}
          </Button>
        </div>
      </ShowIf>
    </>
  )
}
