import { DashboardActivityRow } from '../../types'
import { ActivityTimeline } from './ActivityTimeline'
import { RecentActivityEmpty } from './RecentActivityEmpty'

type RecentActivityResultsProps = {
  isUnfilteredEmpty: boolean
  rows: readonly DashboardActivityRow[]
  timeZone: string
}

export function RecentActivityResults({
  isUnfilteredEmpty,
  rows,
  timeZone,
}: RecentActivityResultsProps) {
  if (isUnfilteredEmpty) {
    return <RecentActivityEmpty />
  }

  return <ActivityTimeline rows={rows} timeZone={timeZone} />
}
