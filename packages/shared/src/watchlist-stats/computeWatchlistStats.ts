import type { ComputeWatchlistStatsInput, StatsMembershipInput, WatchlistStatsCache } from './types'

import { filterMembershipsByTvRule } from './applyTvCountRule'
import { refreshChallengePacing } from './refreshChallengePacing'

type CompletionLatch = Required<Pick<WatchlistStatsCache, 'completedAt' | 'completedTitleCount'>>

type LatchedCompletion = CompletionLatch &
  Required<Pick<WatchlistStatsCache, 'newTitlesSinceCompletion' | 'unfinishedTitlesSinceCompletion'>>

type MembershipTotals = {
  completed: number
  inProgress: number
  totalEligible: number
}

type TitlesAddedSinceCompletion = {
  added: number
  unfinished: number
}

/**
 * Totals for one watchlist from its memberships and challenge settings.
 *
 * A list-size goal counts each qualifying title once. Its target is the titles on
 * the list, so it would move with every add or remove. The first time every title is
 * done, the cache latches `completedAt` and the title count, and keeps reporting
 * `n of n` complete. `newTitlesSinceCompletion` counts qualifying titles added
 * after that finish, and `unfinishedTitlesSinceCompletion` counts the ones still
 * open. The latch carries over from `previousStats`. Reopen measures the list
 * live, and keeps the stored finish when every current title is already watched.
 * An empty list-size goal that never finished is not started, or overdue past due.
 *
 * @param input.previousStats - Stored latch fields. A missing latch starts a new one when the list is fully watched
 * @param input.reopenCompletion - Measure live again. A fully watched list keeps `previousStats`
 * @returns The stats cache, with pacing when the challenge is enabled
 */
export function computeWatchlistStats(input: ComputeWatchlistStatsInput): WatchlistStatsCache {
  const referenceDate = input.referenceDate ?? new Date()
  const challenge = input.challenge
  const qualifyingMemberships = filterMembershipsByTvRule(
    input.memberships,
    challenge?.tvCountRule,
  ).filter(isActiveMembership)

  const goalType = challenge?.goalType ?? 'count'
  const isListSizeGoal = challenge?.enabled === true && goalType === 'list_size'
  const totals = isListSizeGoal
    ? countUnweightedTitles(qualifyingMemberships)
    : sumWeightedUnits(qualifyingMemberships)

  let completedCount = totals.completed
  let completion: LatchedCompletion | null = null
  let totalEligible = totals.totalEligible
  let remaining = Math.max(0, totalEligible - totals.completed)
  let goalCount: number | undefined
  let goalRuntimeMinutes: number | undefined
  let completedRuntimeMinutes: number | undefined
  let remainingRuntimeMinutes: number | undefined

  if (challenge?.enabled && goalType === 'runtime_minutes') {
    goalRuntimeMinutes = challenge.goalRuntimeMinutes ?? totals.totalEligible
    totalEligible = goalRuntimeMinutes
    completedRuntimeMinutes = totals.completed
    remainingRuntimeMinutes = Math.max(0, goalRuntimeMinutes - totals.completed)
    remaining = remainingRuntimeMinutes
  } else if (isListSizeGoal) {
    const latch = resolveCompletionLatch(
      input.previousStats,
      totals,
      referenceDate,
      input.reopenCompletion === true,
    )

    if (latch) {
      // Finished once, so the target stays at the titles that were done.
      const added = titlesAddedSinceCompletion(qualifyingMemberships, latch.completedAt)

      completedCount = latch.completedTitleCount
      completion = {
        ...latch,
        newTitlesSinceCompletion: added.added,
        unfinishedTitlesSinceCompletion: added.unfinished,
      }
      goalCount = latch.completedTitleCount
      remaining = 0
    } else {
      // The target is the qualifying titles currently on the list.
      goalCount = totals.totalEligible
      remaining = Math.max(0, goalCount - totals.completed)
    }

    totalEligible = goalCount
  } else if (challenge?.enabled && goalType === 'count') {
    goalCount = challenge.goalCount ?? totals.totalEligible
    totalEligible = goalCount
    remaining = Math.max(0, goalCount - totals.completed)
  }

  const percentComplete =
    totalEligible > 0 ? Math.min(100, Math.round((completedCount / totalEligible) * 100)) : 0

  const stats: WatchlistStatsCache = {
    completed: completedCount,
    inProgress: totals.inProgress,
    lastCalculatedAt: referenceDate.toISOString(),
    percentComplete,
    remaining,
    totalEligible,
  }

  if (goalCount != null) {
    stats.goalCount = goalCount
  }

  if (completion) {
    Object.assign(stats, completion)
  }

  if (goalRuntimeMinutes != null) {
    stats.goalRuntimeMinutes = goalRuntimeMinutes
    stats.completedRuntimeMinutes = completedRuntimeMinutes
    stats.remainingRuntimeMinutes = remainingRuntimeMinutes
  }

  if (challenge?.enabled) {
    return refreshChallengePacing({
      challenge,
      referenceDate,
      stats,
      watchlistCreatedAt: input.watchlistCreatedAt,
    })
  }

  return stats
}

// One title per membership. Goal weight is not the unit, so a weight left over from another
// goal type (a skipped row is not rewritten on a goal change) cannot change a list-size total.
function countUnweightedTitles(memberships: StatsMembershipInput[]): MembershipTotals {
  return memberships.reduce<MembershipTotals>(
    (totals, membership) => ({
      completed: totals.completed + (membership.listStatus === 'completed' ? 1 : 0),
      inProgress: totals.inProgress + (membership.listStatus === 'in_progress' ? 1 : 0),
      totalEligible: totals.totalEligible + 1,
    }),
    { completed: 0, inProgress: 0, totalEligible: 0 },
  )
}

function getCompletedWeight(membership: StatsMembershipInput): number {
  if (membership.listStatus !== 'completed') {
    return 0
  }

  return membership.goalWeight ?? 1
}

function getEligibleWeight(membership: StatsMembershipInput): number {
  return membership.goalWeight ?? 1
}

function getInProgressWeight(membership: StatsMembershipInput): number {
  if (membership.listStatus !== 'in_progress') {
    return 0
  }

  return membership.goalWeight ?? 1
}

function isActiveMembership(membership: StatsMembershipInput): boolean {
  return membership.listStatus !== 'skipped' && membership.countsTowardGoal !== false
}

function isAddedAfterCompletion(addedAt: string, completedAt: string): boolean {
  const added = Date.parse(addedAt)
  const completed = Date.parse(completedAt)

  return !Number.isNaN(added) && !Number.isNaN(completed) && added > completed
}

// The stored latch, or a new one when every qualifying title on a non-empty list is done.
// Reopen drops the latch unless the list is already fully watched, so that finish time stays put.
function resolveCompletionLatch(
  previous: ComputeWatchlistStatsInput['previousStats'],
  totals: MembershipTotals,
  referenceDate: Date,
  reopenCompletion: boolean,
): CompletionLatch | null {
  const stored = storedCompletionLatch(previous)
  const fullyWatched = totals.totalEligible > 0 && totals.completed >= totals.totalEligible

  if (reopenCompletion) {
    return fullyWatched ? stored : null
  }

  if (stored) {
    return stored
  }

  if (fullyWatched) {
    return {
      completedAt: referenceDate.toISOString(),
      completedTitleCount: totals.totalEligible,
    }
  }

  return null
}

function storedCompletionLatch(
  previous: ComputeWatchlistStatsInput['previousStats'],
): CompletionLatch | null {
  if (previous?.completedAt == null || previous.completedTitleCount == null) {
    return null
  }

  return {
    completedAt: previous.completedAt,
    completedTitleCount: previous.completedTitleCount,
  }
}

// Completed, in-progress, and eligible units from each membership's goal weight.
function sumWeightedUnits(memberships: StatsMembershipInput[]): MembershipTotals {
  return {
    completed: memberships.reduce((sum, membership) => sum + getCompletedWeight(membership), 0),
    inProgress: memberships.reduce((sum, membership) => sum + getInProgressWeight(membership), 0),
    totalEligible: memberships.reduce((sum, membership) => sum + getEligibleWeight(membership), 0),
  }
}

// Qualifying titles added strictly after the finish. Removing an older title does not cancel a later add.
function titlesAddedSinceCompletion(
  memberships: readonly StatsMembershipInput[],
  completedAt: string,
): TitlesAddedSinceCompletion {
  return memberships.reduce<TitlesAddedSinceCompletion>(
    (counts, membership) => {
      if (!isAddedAfterCompletion(membership.addedAt, completedAt)) {
        return counts
      }

      return {
        added: counts.added + 1,
        unfinished: counts.unfinished + (membership.listStatus === 'completed' ? 0 : 1),
      }
    },
    { added: 0, unfinished: 0 },
  )
}
