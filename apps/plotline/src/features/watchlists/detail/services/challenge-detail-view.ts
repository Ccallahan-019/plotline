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
  isRuntimeChallengeGoal,
} from '@plotline/shared/watchlist-stats'

export type ChallengeDetailView = {
  meta: ChallengeMetaLabel[]
  /** Titles added to a completed list-size challenge. Zero unless the challenge is latched. */
  newTitlesSinceCompletion: number
  paceLabel: string
  paceRates: ChallengePaceRateLabel[]
  paceTone: ChallengePaceTone
  percentComplete: number
  progressCompleted: string
  progressGoal: string
  progressLabel: string
  /** Added titles that are not watched yet. Zero unless the challenge is latched. */
  unfinishedTitlesSinceCompletion: number
}

export type ChallengePaceRateLabel = {
  label: 'Original pace' | 'Required pace'
  value: string
}

type ChallengePaceSource = {
  challenge?: null | Watchlist['challenge']
  statsCache?: null | Watchlist['statsCache']
}

type PaceUnit = 'films' | 'hrs' | 'titles'

/**
 * Daily rate still needed to finish the challenge by its due date.
 *
 * Runtime goals show hours. Count and list-size goals show films or titles. A missing rate is an em dash.
 *
 * @param watchlist - Challenge settings plus cached pacing
 * @returns Copy such as `~ 1.5 titles / day`
 */
export function formatRequiredChallengePace(watchlist: ChallengePaceSource): string {
  return formatDailyPace(watchlist.statsCache?.requiredPerDay, getPaceUnit(watchlist))
}

/**
 * Progress hero for a challenge detail page.
 *
 * Copy uses the detail variant (`31 / 52 titles`, or hours). Pace and the bar
 * come from `statsCache`. A missing cache stays "Not started" with an empty bar
 * so a new challenge is not marked complete. `paceTone` is `ahead` when the daily
 * rate is faster than required, and `destructive` when the challenge is behind or overdue.
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
    newTitlesSinceCompletion: stats?.newTitlesSinceCompletion ?? 0,
    paceLabel: pace.label,
    paceRates: getChallengePaceRates(watchlist),
    paceTone: pace.tone,
    percentComplete: stats?.percentComplete ?? 0,
    progressCompleted: progress.completed,
    progressGoal: progress.goal,
    progressLabel,
    unfinishedTitlesSinceCompletion: stats?.unfinishedTitlesSinceCompletion ?? 0,
  }
}

/**
 * Required daily rate in the units pace copy displays.
 *
 * Runtime cache values are minutes per day and come back as hours. Count and list-size
 * goals come back unchanged. A missing or non-finite rate is omitted.
 *
 * @param watchlist - Challenge settings plus cached pacing
 * @returns Hours for a runtime goal, otherwise the cached count rate
 */
export function requiredPerDayInDisplayUnits(watchlist: ChallengePaceSource): number | undefined {
  const amountPerDay = watchlist.statsCache?.requiredPerDay

  if (amountPerDay == null || !Number.isFinite(amountPerDay)) {
    return undefined
  }

  return toDisplayAmountPerDay(amountPerDay, getPaceUnit(watchlist))
}

// `~10.2 hrs / day`. Runtime cache values are minutes per day.
function formatDailyPace(amountPerDay: number | undefined, unit: PaceUnit): string {
  if (amountPerDay == null || !Number.isFinite(amountPerDay)) {
    return '—'
  }

  const display = toDisplayAmountPerDay(amountPerDay, unit)
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
function getChallengePaceRates(watchlist: ChallengePaceSource): ChallengePaceRateLabel[] {
  const unit = getPaceUnit(watchlist)
  const stats = watchlist.statsCache
  const daysTotal = stats?.daysTotal
  const goal = getGoalUnits(watchlist, unit)
  const originalPerDay =
    daysTotal != null && daysTotal > 0 && goal != null ? goal / daysTotal : undefined

  return [
    { label: 'Original pace', value: formatDailyPace(originalPerDay, unit) },
    { label: 'Required pace', value: formatRequiredChallengePace(watchlist) },
  ]
}

// Goal size in the same units the cache uses for per-day rates (minutes or titles).
// List size uses the cached target, which changes as titles are added or removed.
function getGoalUnits(watchlist: ChallengePaceSource, unit: PaceUnit): number | undefined {
  const challenge = watchlist.challenge
  const stats = watchlist.statsCache

  if (unit === 'hrs') {
    return challenge?.goalRuntimeMinutes ?? stats?.goalRuntimeMinutes ?? stats?.totalEligible
  }

  if (challenge?.goalType === 'list_size') {
    return stats?.goalCount ?? stats?.totalEligible
  }

  return challenge?.goalCount ?? stats?.goalCount ?? stats?.totalEligible
}

// Runtime rates display as hours. Count and list-size rates follow the progress copy: films or titles.
function getPaceUnit(watchlist: ChallengePaceSource): PaceUnit {
  if (isRuntimeChallengeGoal(watchlist.challenge ?? {})) {
    return 'hrs'
  }

  if (watchlist.challenge?.tvCountRule === 'movies_only') {
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

// Runtime cache values are minutes per day. Count rates are already titles or films.
function toDisplayAmountPerDay(amountPerDay: number, unit: PaceUnit): number {
  return unit === 'hrs' ? amountPerDay / 60 : amountPerDay
}

// Remaining must be non-zero when the cache is missing, or pace reports Complete.
function toPaceInput(stats: null | undefined | Watchlist['statsCache']): ChallengePaceInput {
  if (!stats) {
    return { remaining: 1, status: 'not_started' }
  }

  return {
    actualPerDay: stats.actualPerDay,
    daysRemaining: stats.daysRemaining,
    newTitlesSinceCompletion: stats.newTitlesSinceCompletion,
    onTrack: stats.onTrack,
    remaining: stats.remaining,
    requiredPerDay: stats.requiredPerDay,
    status: stats.status,
  }
}
