import type { WatchlistChallengeConfig, WatchlistStatsCache } from './types'

import { computeChallengePacing } from './computeChallengePacing'

export type RefreshChallengePacingInput = {
  challenge?: null | WatchlistChallengeConfig
  referenceDate?: Date
  stats: WatchlistStatsCache
  watchlistCreatedAt?: string
}

/**
 * Replaces cached pacing with the rate still required as of `referenceDate`.
 *
 * Completed, remaining, percent, goal totals, and `lastCalculatedAt` stay on
 * the cache. Days left, both daily rates, on-track, projected finish, and
 * status come from the challenge dates and that clock. An empty list-size
 * goal stays not started. A missing or disabled challenge is returned unchanged.
 *
 * @param input.challenge - Stored challenge settings. Pacing is skipped when this is missing or disabled
 * @param input.referenceDate - Clock for days left and pace. Defaults to now
 * @param input.stats - Cached totals from the last membership recalculation
 * @param input.watchlistCreatedAt - Start date when the challenge has none
 * @returns The cache with pacing for `referenceDate`
 */
export function refreshChallengePacing(input: RefreshChallengePacingInput): WatchlistStatsCache {
  const challenge = input.challenge

  if (challenge?.enabled !== true) {
    return input.stats
  }

  const paced = replacePacing(
    input.stats,
    computeChallengePacing({
      challenge,
      completed: input.stats.completed,
      inProgress: input.stats.inProgress,
      referenceDate: input.referenceDate,
      remaining: input.stats.remaining,
      watchlistCreatedAt: input.watchlistCreatedAt,
    }),
  )

  if (isEmptyListSizeGoal(challenge, input.stats)) {
    return keepEmptyListSizeNotStarted(paced)
  }

  return paced
}

// Copies defined pacing fields onto a cache whose previous pacing fields are gone.
function definedPacing(
  pacing: ReturnType<typeof computeChallengePacing>,
): Partial<WatchlistStatsCache> {
  const defined: Partial<WatchlistStatsCache> = {}

  if (pacing.actualPerDay != null) {
    defined.actualPerDay = pacing.actualPerDay
  }

  if (pacing.daysElapsed != null) {
    defined.daysElapsed = pacing.daysElapsed
  }

  if (pacing.daysRemaining != null) {
    defined.daysRemaining = pacing.daysRemaining
  }

  if (pacing.daysTotal != null) {
    defined.daysTotal = pacing.daysTotal
  }

  if (pacing.onTrack != null) {
    defined.onTrack = pacing.onTrack
  }

  if (pacing.projectedFinishDate != null) {
    defined.projectedFinishDate = pacing.projectedFinishDate
  }

  if (pacing.requiredPerDay != null) {
    defined.requiredPerDay = pacing.requiredPerDay
  }

  if (pacing.status != null) {
    defined.status = pacing.status
  }

  return defined
}

// A list-size goal with no qualifying titles. A zero remainder would otherwise look finished.
function isEmptyListSizeGoal(
  challenge: WatchlistChallengeConfig,
  stats: WatchlistStatsCache,
): boolean {
  return (
    challenge.goalType === 'list_size' &&
    stats.completed === 0 &&
    stats.inProgress === 0 &&
    stats.totalEligible === 0
  )
}

// Pacing treats a zero remainder as finished. An empty list has not started.
function keepEmptyListSizeNotStarted(stats: WatchlistStatsCache): WatchlistStatsCache {
  const next: WatchlistStatsCache = {
    ...stats,
    percentComplete: 0,
    status: 'not_started',
  }

  delete next.onTrack
  delete next.projectedFinishDate
  delete next.requiredPerDay

  return next
}

function replacePacing(
  stats: WatchlistStatsCache,
  pacing: ReturnType<typeof computeChallengePacing>,
): WatchlistStatsCache {
  return { ...withoutPacing(stats), ...definedPacing(pacing) }
}

function withoutPacing(stats: WatchlistStatsCache): WatchlistStatsCache {
  const next: WatchlistStatsCache = { ...stats }

  delete next.actualPerDay
  delete next.daysElapsed
  delete next.daysRemaining
  delete next.daysTotal
  delete next.onTrack
  delete next.projectedFinishDate
  delete next.requiredPerDay
  delete next.status

  return next
}
