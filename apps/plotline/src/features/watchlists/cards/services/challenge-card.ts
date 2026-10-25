import {
  type ChallengePaceInput,
  type ChallengePaceTone,
  formatChallengePace,
  formatChallengeProgress,
} from '@plotline/shared/watchlist-stats'

import type { WatchlistCard } from '../types'

export type ChallengeCardView = {
  paceLabel: string
  paceTone: ChallengePaceTone
  percentComplete: number
  progressLabel: string
}

/**
 * Progress block for a challenge on the shared watchlist card.
 *
 * Progress copy uses the card variant (`31 of 52 titles`, `12 of 40 titles` for a list, or hours). Pace comes
 * from `statsCache`. A missing cache stays "Not started" with an empty bar so a
 * new challenge is not marked complete. `paceTone` is `ahead` when the daily rate
 * is faster than required, and `destructive` when the challenge is behind or overdue.
 * The destructive tone is the progress bar color.
 *
 * @param card - Challenge settings and stats already copied onto the card
 * @returns Labels and percent for the card's progress block
 */
export function getChallengeCardView(
  card: Pick<WatchlistCard, 'challenge' | 'statsCache'>,
): ChallengeCardView {
  const stats = card.statsCache
  const pace = formatChallengePace(toPaceInput(stats))

  return {
    paceLabel: pace.label,
    paceTone: pace.tone,
    percentComplete: stats?.percentComplete ?? 0,
    progressLabel: formatChallengeProgress({
      completed: stats?.completed ?? 0,
      goalCount: progressGoalCount(card),
      goalRuntimeMinutes: card.challenge?.goalRuntimeMinutes,
      goalType: card.challenge?.goalType,
      totalEligible: stats?.totalEligible ?? 0,
      tvCountRule: card.challenge?.tvCountRule,
      variant: 'card',
    }),
  }
}

// List size stores no target. The cached count is the denominator, then total eligible.
function progressGoalCount(
  card: Pick<WatchlistCard, 'challenge' | 'statsCache'>,
): null | number | undefined {
  if (card.challenge?.goalType === 'list_size') {
    return card.statsCache?.goalCount ?? null
  }

  return card.challenge?.goalCount
}

// Remaining must be non-zero when the cache is missing, or pace reports Complete.
function toPaceInput(stats: WatchlistCard['statsCache']): ChallengePaceInput {
  if (!stats) {
    return { remaining: 1, status: 'not_started' }
  }

  return {
    actualPerDay: stats.actualPerDay,
    daysRemaining: stats.daysRemaining,
    onTrack: stats.onTrack,
    remaining: stats.remaining,
    requiredPerDay: stats.requiredPerDay,
    status: stats.status,
  }
}
