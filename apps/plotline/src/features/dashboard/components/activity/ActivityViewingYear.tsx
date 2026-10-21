import { useActivityViewingYear } from '@/features/dashboard/hooks/use-activity-viewing-year'

import { DashboardHeatmap } from '../overview/recent-activity/DashboardHeatmap'
import { DashboardWidgetEmpty } from '../state/DashboardWidgetEmpty'
import { DashboardWidgetError } from '../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../state/DashboardWidgetSkeleton'

type ActivityViewingYearProps = {
  onSelectDay: (date: string) => void
  selectedDate: null | string
  timeZone: string
}

export function ActivityViewingYear({
  onSelectDay,
  selectedDate,
  timeZone,
}: ActivityViewingYearProps) {
  const { isError, isFetching, isPending, refetch, setYear, summary, year, years } =
    useActivityViewingYear(timeZone)

  function handleRetry() {
    void refetch()
  }

  function handleYearChange(nextYear: number) {
    setYear(nextYear)
  }

  if (isPending) {
    return <DashboardWidgetSkeleton className="h-48" />
  }

  if (isError && summary == null) {
    return <DashboardWidgetError message="Couldn't load your viewing year." onRetry={handleRetry} />
  }

  if (summary == null) {
    return (
      <DashboardWidgetEmpty description="No viewing year was found." title="Your viewing year" />
    )
  }

  return (
    <DashboardHeatmap
      busy={isFetching}
      onSelectDay={onSelectDay}
      onYearChange={handleYearChange}
      selectedDate={selectedDate}
      summary={summary}
      year={year}
      years={years}
    />
  )
}
