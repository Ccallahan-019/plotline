import type { ChallengeSpotlightPaceBadge } from '@/features/dashboard/services/challenge-spotlight'

import { Badge } from '@/components/ui/badge'

const PACE_BADGE_CLASS_NAME: Record<ChallengeSpotlightPaceBadge['tone'], string | undefined> = {
  ahead: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  behind: undefined,
}

const PACE_BADGE_VARIANT: Record<ChallengeSpotlightPaceBadge['tone'], 'destructive' | 'secondary'> =
  {
    ahead: 'secondary',
    behind: 'destructive',
  }

export function DashboardChallengeSpotlightPaceBadge({ label, tone }: ChallengeSpotlightPaceBadge) {
  return (
    <Badge className={PACE_BADGE_CLASS_NAME[tone]} variant={PACE_BADGE_VARIANT[tone]}>
      {label}
    </Badge>
  )
}
