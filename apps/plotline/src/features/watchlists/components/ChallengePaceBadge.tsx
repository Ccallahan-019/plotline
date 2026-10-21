import type { ChallengePaceTone } from '@plotline/shared/watchlist-stats'

import { Activity } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ChallengePaceBadgeProps = {
  label: string
  tone: ChallengePaceTone
}

const PACE_BADGE_CLASS_NAME: Record<ChallengePaceTone, string | undefined> = {
  ahead: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300',
  default: undefined,
  destructive: undefined,
  neutral: undefined,
}

const PACE_BADGE_VARIANT: Record<ChallengePaceTone, 'default' | 'destructive' | 'secondary'> = {
  ahead: 'secondary',
  default: 'default',
  destructive: 'destructive',
  neutral: 'secondary',
}

export function ChallengePaceBadge({ label, tone }: ChallengePaceBadgeProps) {
  return (
    <Badge
      className={cn('h-auto max-w-full whitespace-normal', PACE_BADGE_CLASS_NAME[tone])}
      variant={PACE_BADGE_VARIANT[tone]}
    >
      <Activity data-icon="inline-start" />
      {label}
    </Badge>
  )
}
