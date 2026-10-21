import { Progress } from '@/components/ui/progress'

import { activityChallengePercent } from '../../services/activity-display'
import { DashboardActivityRow } from '../../types'

type ActivityChallengeBarProps = Pick<DashboardActivityRow, 'filterKind' | 'progress'>

export function ActivityChallengeBar({ filterKind, progress }: ActivityChallengeBarProps) {
  const percent = activityChallengePercent({ filterKind, progress })

  if (percent == null) {
    return null
  }

  return <Progress aria-hidden className="w-48 max-w-full" trackClassName="h-1.5" value={percent} />
}
