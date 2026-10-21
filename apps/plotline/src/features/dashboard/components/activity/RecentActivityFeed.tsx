import { useRef } from 'react'

import { useRecentActivityFeed } from '@/features/dashboard/hooks/use-recent-activity-feed'
import { activitySelectedDay } from '@/features/dashboard/services/activity-display'

import { ActivityFilters } from './ActivityFilters'
import { ActivityViewingYear } from './ActivityViewingYear'
import { RecetActivityFeedContent } from './RecetActivityFeedContent'

type RecentActivityFeedProps = {
  timeZone: string
}

export function RecentActivityFeed({ timeZone }: RecentActivityFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  const {
    fetchNextPage,
    hasNextPage,
    isError,
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

  function handleFetchNextPage() {
    void fetchNextPage()
  }

  function handleRetry() {
    void refetch()
  }

  function handleSelectDay(date: string) {
    setRange(date)
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex scroll-mt-4 flex-col gap-6" ref={feedRef}>
        <div className="min-w-0 flex-1">
          <ActivityFilters
            kind={kind}
            mediaType={mediaType}
            onKindChange={setKind}
            onMediaTypeChange={setMediaType}
            onRangeChange={setRange}
            range={range}
          />
        </div>

        <RecetActivityFeedContent
          hasNextPage={hasNextPage}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          isLoading={isLoading}
          kind={kind}
          mediaType={mediaType}
          onFetchNextPage={handleFetchNextPage}
          onRetry={handleRetry}
          range={range}
          rows={rows}
          timeZone={timeZone}
        />
      </div>
      <ActivityViewingYear
        onSelectDay={handleSelectDay}
        selectedDate={activitySelectedDay(range)}
        timeZone={timeZone}
      />
    </div>
  )
}
