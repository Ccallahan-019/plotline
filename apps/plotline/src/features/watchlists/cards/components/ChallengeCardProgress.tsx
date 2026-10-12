import { ChallengePaceTone } from '@plotline/shared/watchlist-stats'
import { Activity } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProgressLabel } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

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
        value={view.percentComplete}
      >
        <ProgressLabel>{view.progressLabel}</ProgressLabel>
      </Progress>
      <div className="flex justify-end">
        <Badge
          className="h-auto max-w-full whitespace-normal"
          variant={paceBadgeVariant(view.paceTone)}
        >
          <Activity data-icon="inline-start" />
          {view.paceLabel}
        </Badge>
      </div>
    </div>
  )
}

function paceBadgeVariant(tone: ChallengePaceTone): 'default' | 'destructive' | 'secondary' {
  switch (tone) {
    case 'default':
      return 'default'
    case 'destructive':
      return 'destructive'
    case 'neutral':
      return 'secondary'
    default: {
      const exhaustive: never = tone

      return exhaustive
    }
  }
}
