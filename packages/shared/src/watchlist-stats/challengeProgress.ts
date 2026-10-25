import type { ChallengeGoalType, TvCountRule } from '../constants/watchlist-challenge'
import type { WatchlistChallengeConfig } from './types'

import { formatReleaseDateForCalendar } from '../utils/dates'
import { formatNumber } from '../utils/formatNumber'

export type ChallengeMetaLabel = {
  label: 'Due date' | 'Goal type' | 'Rewatches' | 'TV counting'
  value: string
}

export type ChallengeProgressInput = {
  completed: number
  goalCount?: null | number
  goalRuntimeMinutes?: null | number
  goalType?: ChallengeGoalType | null
  totalEligible: number
  tvCountRule?: null | TvCountRule
  variant: ChallengeProgressVariant
}

export type ChallengeProgressVariant = 'card' | 'detail'

const formatGoalType: Record<ChallengeGoalType, string> = {
  count: 'Count',
  list_size: 'List',
  runtime_minutes: 'Runtime',
}

/**
 * Progress line for a challenge card (`31 of 52 titles`) or detail hero (`31 / 52 titles`).
 *
 * The denominator is `goalCount` or `goalRuntimeMinutes`, then `totalEligible`. Count and
 * list-size goals say titles, or films when the TV rule is movies only. A list-size caller
 * passes a null stored count and the cache's `totalEligible` (`12 of 40 titles`). Runtime
 * goals format stored minutes as hours, and a whole hour stays an integer.
 *
 * @param input.completed - `statsCache.completed`, in titles or minutes
 * @param input.goalCount - Count goal; falls back to `totalEligible`. Null for list size
 * @param input.goalRuntimeMinutes - Runtime goal in minutes; falls back to `totalEligible`
 * @param input.goalType - Selects count, list size, or runtime. Inferred from which goal is set when omitted
 * @param input.totalEligible - Fallback denominator from `statsCache`
 * @param input.tvCountRule - `movies_only` uses films for count and list-size goals
 * @param input.variant - Card uses "of"; detail uses "/"
 * @returns The progress line
 */
export function formatChallengeProgress(input: ChallengeProgressInput): string {
  const separator = input.variant === 'detail' ? '/' : 'of'

  if (isRuntimeGoal(input)) {
    const completedHours = formatHoursFromMinutes(input.completed)
    const goalHours = formatHoursFromMinutes(input.goalRuntimeMinutes ?? input.totalEligible)

    return `${completedHours} ${separator} ${goalHours} hrs`
  }

  const goal = input.goalCount ?? input.totalEligible
  const unit = input.tvCountRule === 'movies_only' ? 'films' : 'titles'

  return `${formatNumber(input.completed)} ${separator} ${formatNumber(goal)} ${unit}`
}

/**
 * Detail meta rows under the challenge progress hero.
 *
 * @param challenge - Goal, due date, TV counting, and rewatch settings
 * @returns Goal type, due date, TV counting, and rewatches, in that order
 */
export function getChallengeMetaLabels(
  challenge: Pick<
    WatchlistChallengeConfig,
    'dueDate' | 'goalType' | 'includeRewatches' | 'tvCountRule'
  >,
): ChallengeMetaLabel[] {
  return [
    { label: 'Goal type', value: formatGoalType[challenge.goalType ?? 'count'] },
    { label: 'Due date', value: formatDueDate(challenge.dueDate) },
    { label: 'TV counting', value: formatTvCountRule(challenge.tvCountRule) },
    { label: 'Rewatches', value: challenge.includeRewatches === true ? 'Included' : 'Excluded' },
  ]
}

function formatDueDate(dueDate: null | string | undefined): string {
  if (!dueDate) {
    return '—'
  }

  return formatReleaseDateForCalendar(dueDate.slice(0, 10)) ?? '—'
}

// Whole hours stay integers. Any other duration shows one decimal hour.
function formatHoursFromMinutes(minutes: number): string {
  const hours = Math.round((Math.max(0, minutes) / 60) * 10) / 10

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(hours) ? 0 : 1,
  }).format(hours)
}

function formatTvCountRule(rule: null | TvCountRule | undefined): string {
  switch (rule) {
    case 'movies_only':
      return 'Movies only'
    case null:
    case undefined:
      return 'As a series'
    case 'tv_as_series':
      return 'As a series'
    case 'tv_by_episode':
      return 'By episode'
    case 'tv_by_season':
      return 'By season'
    default: {
      const _exhaustive: never = rule

      return _exhaustive
    }
  }
}

// Runtime when the type says so, or when the type is omitted and only minutes are stored.
// List size stays a title count even if a previous runtime value is still on the document.
function isRuntimeGoal(input: ChallengeProgressInput): boolean {
  switch (input.goalType) {
    case 'count':
    case 'list_size':
      return false
    case null:
    case undefined:
      return input.goalRuntimeMinutes != null && input.goalCount == null
    case 'runtime_minutes':
      return true
    default: {
      const _exhaustive: never = input.goalType

      return _exhaustive
    }
  }
}
