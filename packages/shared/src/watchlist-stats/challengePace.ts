import type { ChallengeStatsStatus } from '../constants/watchlist-challenge'

import { formatNumber } from '../utils/formatNumber'

export type ChallengePaceBadge = {
  label: string
  tone: ChallengePaceTone
}

export type ChallengePaceInput = {
  actualPerDay?: number
  daysRemaining?: number
  onTrack?: boolean
  remaining: number
  requiredPerDay?: number
  status?: ChallengeStatsStatus
}

export type ChallengePaceTone = 'ahead' | 'default' | 'destructive' | 'neutral'

/**
 * Pace badge for a challenge card or detail hero.
 *
 * A challenge that has not started stays neutral, including an empty list-size goal whose
 * remainder is zero. Complete and overdue win over the daily rate. A rate that is not
 * computable yet (day zero) stays neutral so the challenge is not immediately behind.
 * Ahead is a faster rate than required (`tone` is `ahead`). On track includes an equal
 * rate (`onTrack` stays `actualPerDay >= requiredPerDay`) and keeps the default tone.
 *
 * @param input - Fields already stored on `statsCache`. Does not add cache fields
 * @returns Label and tone for the badge
 */
export function formatChallengePace(input: ChallengePaceInput): ChallengePaceBadge {
  if (input.status === 'not_started') {
    return { label: withDaysLeft('Not started', input.daysRemaining), tone: 'neutral' }
  }

  if (input.remaining === 0 || input.status === 'completed') {
    return { label: 'Complete', tone: 'default' }
  }

  if (input.status === 'overdue') {
    return { label: 'Overdue', tone: 'destructive' }
  }

  const { actualPerDay, requiredPerDay } = input

  if (actualPerDay == null || requiredPerDay == null) {
    return { label: withDaysLeft('Not started', input.daysRemaining), tone: 'neutral' }
  }

  if (actualPerDay > requiredPerDay) {
    return { label: withDaysLeft('Ahead of pace', input.daysRemaining), tone: 'ahead' }
  }

  const onTrack = input.onTrack ?? actualPerDay >= requiredPerDay

  if (onTrack) {
    return { label: withDaysLeft('On track', input.daysRemaining), tone: 'default' }
  }

  return { label: withDaysLeft('Behind pace', input.daysRemaining), tone: 'destructive' }
}

function withDaysLeft(prefix: string, daysRemaining: number | undefined): string {
  if (daysRemaining == null) {
    return prefix
  }

  const unit = daysRemaining === 1 ? 'day' : 'days'

  return `${prefix} · ${formatNumber(daysRemaining)} ${unit} left`
}
