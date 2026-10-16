import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

type DashboardChallengeSpotlightStatsProps = {
  completedLabel: string
  destructive: boolean
  perWeekLabel: null | string
  requiredPaceLabel: string
}

export function DashboardChallengeSpotlightStats({
  completedLabel,
  destructive,
  perWeekLabel,
  requiredPaceLabel,
}: DashboardChallengeSpotlightStatsProps) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <dd className="text-sm font-medium tabular-nums">{completedLabel}</dd>
        <dt className="text-xs text-muted-foreground">Completed</dt>
      </div>
      <ShowIf condition={perWeekLabel != null}>
        <div className="flex min-w-0 flex-col gap-0.5">
          <dd className="text-sm font-medium tabular-nums">{perWeekLabel}</dd>
          <dt className="text-xs text-muted-foreground">Per week</dt>
        </div>
      </ShowIf>
      <div className="flex min-w-0 flex-col gap-0.5">
        <dd className={cn('text-sm font-medium tabular-nums', destructive && 'text-destructive')}>
          {requiredPaceLabel}
        </dd>
        <dt className="text-xs text-muted-foreground">Required Pace</dt>
      </div>
    </dl>
  )
}
