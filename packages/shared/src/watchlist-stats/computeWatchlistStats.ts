import type { ComputeWatchlistStatsInput, StatsMembershipInput, WatchlistStatsCache } from './types'

import { filterMembershipsByTvRule } from './applyTvCountRule'
import { computeChallengePacing } from './computeChallengePacing'

export function computeWatchlistStats(input: ComputeWatchlistStatsInput): WatchlistStatsCache {
  const referenceDate = input.referenceDate ?? new Date()
  const challenge = input.challenge
  const tvFiltered = filterMembershipsByTvRule(input.memberships, challenge?.tvCountRule)
  const activeMemberships = tvFiltered.filter(isActiveMembership)

  const completed = activeMemberships.reduce(
    (sum, membership) => sum + getCompletedWeight(membership),
    0,
  )
  const inProgress = activeMemberships.reduce(
    (sum, membership) => sum + getInProgressWeight(membership),
    0,
  )

  const goalType = challenge?.goalType ?? 'count'
  const isRuntimeGoal = challenge?.enabled && goalType === 'runtime_minutes'

  const totalEligibleUnits = activeMemberships.reduce(
    (sum, membership) => sum + getEligibleWeight(membership),
    0,
  )

  let totalEligible = totalEligibleUnits
  let remaining = Math.max(0, totalEligible - completed)
  let goalCount: number | undefined
  let goalRuntimeMinutes: number | undefined
  let completedRuntimeMinutes: number | undefined
  let remainingRuntimeMinutes: number | undefined

  if (isRuntimeGoal) {
    goalRuntimeMinutes = challenge?.goalRuntimeMinutes ?? totalEligibleUnits
    totalEligible = goalRuntimeMinutes
    completedRuntimeMinutes = completed
    remainingRuntimeMinutes = Math.max(0, goalRuntimeMinutes - completed)
    remaining = remainingRuntimeMinutes
  } else if (challenge?.enabled && goalType === 'count') {
    goalCount = challenge.goalCount ?? totalEligibleUnits
    totalEligible = goalCount
    remaining = Math.max(0, goalCount - completed)
  }

  const percentComplete =
    totalEligible > 0 ? Math.min(100, Math.round((completed / totalEligible) * 100)) : 0

  const stats: WatchlistStatsCache = {
    completed,
    inProgress,
    lastCalculatedAt: referenceDate.toISOString(),
    percentComplete,
    remaining,
    totalEligible,
  }

  if (goalCount != null) {
    stats.goalCount = goalCount
  }

  if (goalRuntimeMinutes != null) {
    stats.goalRuntimeMinutes = goalRuntimeMinutes
    stats.completedRuntimeMinutes = completedRuntimeMinutes
    stats.remainingRuntimeMinutes = remainingRuntimeMinutes
  }

  if (challenge?.enabled) {
    Object.assign(
      stats,
      computeChallengePacing({
        challenge,
        completed,
        inProgress,
        referenceDate,
        remaining,
        watchlistCreatedAt: input.watchlistCreatedAt,
      }),
    )
  }

  return stats
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
