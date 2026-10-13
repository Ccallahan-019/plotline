import type { Watchlist } from '@plotline/payload-types'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { ChallengePaceBadge } from '../../components/ChallengePaceBadge'
import { getChallengeDetailView } from '../services/challenge-detail-view'

type ChallengeProgressCardProps = {
  watchlist: Watchlist
}

export function ChallengeProgressCard({ watchlist }: ChallengeProgressCardProps) {
  const view = getChallengeDetailView(watchlist)
  const destructive = view.paceTone === 'destructive'

  return (
    <Card aria-label="Challenge progress" role="region">
      <CardHeader>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {view.progressCompleted}{' '}
          <span className="text-base text-muted-foreground">{view.progressGoal}</span>
        </CardTitle>
        <CardAction>
          <ChallengePaceBadge label={view.paceLabel} tone={view.paceTone} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Progress
          aria-label={view.progressLabel}
          indicatorClassName={cn(destructive && 'bg-destructive')}
          max={100}
          trackClassName="h-2"
          value={view.percentComplete}
        />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
          {view.paceRates.map((item) => (
            <div className="flex min-w-0 flex-col gap-1" key={item.label}>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                {item.label}
              </dt>
              <dd className="text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
          {view.meta.map((item) => (
            <div className="flex min-w-0 flex-col gap-1" key={item.label}>
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                {item.label}
              </dt>
              <dd className="text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
