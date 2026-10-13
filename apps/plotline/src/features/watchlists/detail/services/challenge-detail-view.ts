import type { Watchlist } from '@plotline/payload-types'
import type {
  ChallengeMetaLabel,
  ChallengePaceInput,
  ChallengePaceTone,
} from '@plotline/shared/watchlist-stats'

import {
  formatChallengePace,
  formatChallengeProgress,
  getChallengeMetaLabels,
} from '@plotline/shared/watchlist-stats'

export type ChallengeDetailView = {
  meta: ChallengeMetaLabel[]
  paceLabel: string
  paceRates: ChallengePaceRateLabel[]
  paceTone: ChallengePaceTone
  percentComplete: number
  progressCompleted: string
  progressGoal: string
  progressLabel: string
}

export type ChallengePaceRateLabel = {
  label: 'Original pace' | 'Required pace'
  value: string
}

type PaceUnit = 'films' | 'hrs' | 'titles'

/**
 * Progress hero for a challenge detail page.
 *
 * Copy uses the detail variant (`31 / 52 titles`, or hours). Pace and the bar
 * come from `statsCache`. A missing cache stays "Not started" with an empty bar
 * so a new challenge is not marked complete. `paceTone` is `destructive` when
 * the challenge is behind or overdue.
 *
 * @param watchlist - Challenge settings and stats on the watchlist document
 * @returns Labels, tone, percent, meta rows, and daily pace rates for the progress card
 */
export function getChallengeDetailView(
  watchlist: Pick<Watchlist, 'challenge' | 'statsCache'>,
): ChallengeDetailView {
  const stats = watchlist.statsCache
  const pace = formatChallengePace(toPaceInput(stats))
  const progressLabel = formatChallengeProgress({
    completed: stats?.completed ?? 0,
    goalCount: watchlist.challenge?.goalCount,
    goalRuntimeMinutes: watchlist.challenge?.goalRuntimeMinutes,
    goalType: watchlist.challenge?.goalType,
    totalEligible: stats?.totalEligible ?? 0,
    tvCountRule: watchlist.challenge?.tvCountRule,
    variant: 'detail',
  })
  const progress = splitDetailProgressLabel(progressLabel)

  return {
    meta: getChallengeMetaLabels(watchlist.challenge ?? {}),
    paceLabel: pace.label,
    paceRates: getChallengePaceRates(watchlist),
    paceTone: pace.tone,
    percentComplete: stats?.percentComplete ?? 0,
    progressCompleted: progress.completed,
    progressGoal: progress.goal,
    progressLabel,
  }
}

// `~10.2 hrs / day`. Runtime cache values are minutes per day.
function formatDailyPace(amountPerDay: number | undefined, unit: PaceUnit): string {
  if (amountPerDay == null || !Number.isFinite(amountPerDay)) {
    return '—'
  }

  const display = unit === 'hrs' ? amountPerDay / 60 : amountPerDay
  const rounded = Math.round(display * 10) / 10
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(rounded)

  return `~ ${formatted} ${unit} / day`
}

/**
 * Original pace is the goal spread across the whole window. Required pace is the
 * rate still needed to finish by the due date.
 *
 * @param watchlist - Challenge settings plus cached pacing
 * @returns Original and required daily rates, or an em dash when a rate cannot be computed
 */
function getChallengePaceRates(
  watchlist: Pick<Watchlist, 'challenge' | 'statsCache'>,
): ChallengePaceRateLabel[] {
  const unit = getPaceUnit(watchlist)
  const stats = watchlist.statsCache
  const daysTotal = stats?.daysTotal
  const goal = getGoalUnits(watchlist, unit)
  const originalPerDay =
    daysTotal != null && daysTotal > 0 && goal != null ? goal / daysTotal : undefined

  return [
    { label: 'Original pace', value: formatDailyPace(originalPerDay, unit) },
    { label: 'Required pace', value: formatDailyPace(stats?.requiredPerDay, unit) },
  ]
}

// Goal size in the same units the cache uses for per-day rates (minutes or titles).
function getGoalUnits(
  watchlist: Pick<Watchlist, 'challenge' | 'statsCache'>,
  unit: PaceUnit,
): number | undefined {
  const challenge = watchlist.challenge
  const stats = watchlist.statsCache

  if (unit === 'hrs') {
    return challenge?.goalRuntimeMinutes ?? stats?.goalRuntimeMinutes ?? stats?.totalEligible
  }

  return challenge?.goalCount ?? stats?.goalCount ?? stats?.totalEligible
}

// Runtime rates display as hours. Count rates follow the progress copy: films or titles.
function getPaceUnit(watchlist: Pick<Watchlist, 'challenge' | 'statsCache'>): PaceUnit {
  const challenge = watchlist.challenge

  if (challenge?.goalType === 'runtime_minutes') {
    return 'hrs'
  }

  if (
    challenge?.goalType !== 'count' &&
    challenge?.goalRuntimeMinutes != null &&
    challenge.goalCount == null
  ) {
    return 'hrs'
  }

  if (challenge?.tvCountRule === 'movies_only') {
    return 'films'
  }

  return 'titles'
}

// The hero styles the completed count apart from the goal (` / 52 titles`).
function splitDetailProgressLabel(label: string): { completed: string; goal: string } {
  const separator = ' / '
  const index = label.indexOf(separator)

  if (index === -1) {
    return { completed: label, goal: '' }
  }

  return { completed: label.slice(0, index), goal: label.slice(index) }
}

// Remaining must be non-zero when the cache is missing, or pace reports Complete.
function toPaceInput(stats: null | undefined | Watchlist['statsCache']): ChallengePaceInput {
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
