import type { ChallengePaceTone } from '@plotline/shared/watchlist-stats'

import { Activity } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

type ChallengePaceBadgeProps = {
  label: string
  tone: ChallengePaceTone
}

export function ChallengePaceBadge({ label, tone }: ChallengePaceBadgeProps) {
  return (
    <Badge className="h-auto max-w-full whitespace-normal" variant={paceBadgeVariant(tone)}>
      <Activity data-icon="inline-start" />
      {label}
    </Badge>
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
