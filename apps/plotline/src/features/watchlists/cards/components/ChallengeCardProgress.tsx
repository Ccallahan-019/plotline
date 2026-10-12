import { Progress, ProgressLabel } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { ChallengePaceBadge } from '../../components/ChallengePaceBadge'
import { getChallengeCardView } from '../services/challenge-card'
import { WatchlistCard } from '../types'

type ChallengeCardProgressProps = {
  card: WatchlistCard
}

export function ChallengeCardProgress({ card }: ChallengeCardProgressProps) {
  const view = getChallengeCardView(card)
  const destructive = view.paceTone === 'destructive'

  return (
    <div className="flex flex-col gap-3">
      <Progress
        aria-label={view.progressLabel}
        className="gap-2"
        indicatorClassName={cn(destructive && 'bg-destructive')}
        max={100}
        trackClassName="h-1.5"
        value={view.percentComplete}
      >
        <ProgressLabel>{view.progressLabel}</ProgressLabel>
      </Progress>
      <div className="flex justify-end">
        <ChallengePaceBadge label={view.paceLabel} tone={view.paceTone} />
      </div>
    </div>
  )
}
