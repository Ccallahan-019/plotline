import { activityRowSubtitle } from '../../services/activity-display'
import { DashboardActivityFilterKind } from '../../types'

type ActivityRowDetailProps = {
  detail: null | string
  filterKind: DashboardActivityFilterKind
}

export function ActivityRowDetail({ detail, filterKind }: ActivityRowDetailProps) {
  const subtitle = activityRowSubtitle({ detail, filterKind })

  if (!subtitle) {
    return null
  }

  return <p className="text-xs text-muted-foreground">{subtitle}</p>
}
