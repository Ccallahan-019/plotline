import { Progress } from '@/components/ui/progress'

import { activityChallengePercent } from '../../services/activity-display'
import { DashboardActivityFilterKind } from '../../types'

type ActivityChallengeBarProps = {
  detail: null | string
  filterKind: DashboardActivityFilterKind
}

export function ActivityChallengeBar({ detail, filterKind }: ActivityChallengeBarProps) {
  const percent = activityChallengePercent({ detail, filterKind })

  if (percent == null || detail == null) {
    return null
  }

  return <Progress aria-hidden className="w-48 max-w-full" trackClassName="h-1.5" value={percent} />
}
