import type { ChallengeStatsStatus } from '../constants/watchlist-challenge'

import { formatNumber } from '../utils/formatNumber'

export type ChallengePaceBadge = {
  label: string
  tone: ChallengePaceTone
}

export type ChallengePaceInput = {
  actualPerDay?: number
  daysRemaining?: number
  /** `statsCache.newTitlesSinceCompletion`, set while a list-size challenge is latched complete. */
  newTitlesSinceCompletion?: number
  onTrack?: boolean
  remaining: number
  requiredPerDay?: number
  status?: ChallengeStatsStatus
}

export type ChallengePaceTone = 'ahead' | 'default' | 'destructive' | 'neutral'

/**
 * Pace badge for a challenge card or detail hero.
 *
 * A challenge that has not started stays neutral. Overdue wins over a zero remainder, so an
 * empty list-size goal past due reads overdue. Complete and overdue win over the daily rate.
 * A completed list-size challenge with titles added since reads
 * `Completed - 2 New Titles Added`. A rate that is not
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

  if (input.status === 'overdue') {
    return { label: 'Overdue', tone: 'destructive' }
  }

  if (input.remaining === 0 || input.status === 'completed') {
    return { label: completeLabel(input.newTitlesSinceCompletion), tone: 'default' }
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

// `Complete`, or the count of titles added to a list-size challenge since it finished.
function completeLabel(newTitles: number | undefined): string {
  if (newTitles == null || newTitles <= 0) {
    return 'Complete'
  }

  return `Completed - ${formatNumber(newTitles)} New ${newTitles === 1 ? 'Title' : 'Titles'} Added`
}

function withDaysLeft(prefix: string, daysRemaining: number | undefined): string {
  if (daysRemaining == null) {
    return prefix
  }

  const unit = daysRemaining === 1 ? 'day' : 'days'

  return `${prefix} · ${formatNumber(daysRemaining)} ${unit} left`
}
