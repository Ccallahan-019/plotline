import type { ComputeWatchlistStatsInput, StatsMembershipInput, WatchlistStatsCache } from './types'

import { filterMembershipsByTvRule } from './applyTvCountRule'
import { refreshChallengePacing } from './refreshChallengePacing'

type MembershipTotals = {
  completed: number
  inProgress: number
  totalEligible: number
}

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
    // The target is the qualifying titles currently on the list.
    goalCount = totals.totalEligible
    totalEligible = goalCount
    remaining = Math.max(0, goalCount - totals.completed)
  } else if (challenge?.enabled && goalType === 'count') {
    goalCount = challenge.goalCount ?? totals.totalEligible
    totalEligible = goalCount
    remaining = Math.max(0, goalCount - totals.completed)
  }

  const percentComplete =
    totalEligible > 0 ? Math.min(100, Math.round((totals.completed / totalEligible) * 100)) : 0

  const stats: WatchlistStatsCache = {
    completed: totals.completed,
    inProgress: totals.inProgress,
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
    return refreshChallengePacing({
      challenge,
      referenceDate,
      stats,
      watchlistCreatedAt: input.watchlistCreatedAt,
    })
  }

  return stats
}

// One title per membership. Goal weight is not the unit.
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

// Completed, in-progress, and eligible units from each membership's goal weight.
function sumWeightedUnits(memberships: StatsMembershipInput[]): MembershipTotals {
  return {
    completed: memberships.reduce((sum, membership) => sum + getCompletedWeight(membership), 0),
    inProgress: memberships.reduce((sum, membership) => sum + getInProgressWeight(membership), 0),
    totalEligible: memberships.reduce((sum, membership) => sum + getEligibleWeight(membership), 0),
  }
}
