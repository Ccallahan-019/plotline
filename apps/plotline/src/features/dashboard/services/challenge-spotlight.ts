import type { WatchlistCard } from '@/features/watchlists/cards/types'

import {
  formatRequiredChallengePace,
  requiredPerDayInDisplayUnits,
} from '@/features/watchlists/detail/services/challenge-detail-view'

import { formatDashboardCount, formatDashboardQuantity } from './format-dashboard'

export type ChallengeSpotlightLegend = {
  completedLabel: string
  daysLeftLabel: null | string
  perWeekLabel: null | string
  requiredPaceLabel: string
}

export type ChallengeSpotlightPaceBadge = {
  label: 'Ahead of pace' | 'Behind pace'
  tone: 'ahead' | 'behind'
}

/**
 * Legend and days-left copy for the featured challenge.
 *
 * Completed is the cached count. Per week is the required daily rate times 7
 * in the units pace copy shows (a title count, or hours for a runtime goal),
 * and is omitted when that rate is missing. Days left is omitted when the
 * cache has no remaining-day count. Required pace is the daily rate still
 * needed to finish by the due date, with its unit, or an em dash when that
 * rate is missing.
 *
 * @param card - Challenge settings and `statsCache` on the featured card
 * @returns Labels for the spotlight legend. Per week and days left are null when absent
 */
export function getChallengeSpotlightLegend(
  card: Pick<WatchlistCard, 'challenge' | 'statsCache'>,
): ChallengeSpotlightLegend {
  const stats = card.statsCache

  return {
    completedLabel: formatDashboardCount(stats?.completed ?? 0),
    daysLeftLabel: formatDaysLeft(stats?.daysRemaining),
    perWeekLabel: formatPerWeek(requiredPerDayInDisplayUnits(card)),
    requiredPaceLabel: formatRequiredChallengePace(card),
  }
}

/**
 * Ahead/behind badge for the spotlight description.
 *
 * Ahead is a faster daily rate than required. Behind is a slower rate, or an
 * overdue challenge. An even rate, a finished goal, and a rate that cannot be
 * compared yet have no badge.
 *
 * @param stats - `statsCache` on the featured card
 * @returns The badge label and tone, or null when the challenge is not ahead or behind
 */
export function getChallengeSpotlightPaceBadge(
  stats: WatchlistCard['statsCache'],
): ChallengeSpotlightPaceBadge | null {
  if (
    !stats ||
    stats.remaining === 0 ||
    stats.status === 'completed' ||
    stats.status === 'not_started'
  ) {
    return null
  }

  if (stats.status === 'overdue') {
    return { label: 'Behind pace', tone: 'behind' }
  }

  const { actualPerDay, requiredPerDay } = stats

  if (actualPerDay == null || requiredPerDay == null) {
    return null
  }

  if (actualPerDay > requiredPerDay) {
    return { label: 'Ahead of pace', tone: 'ahead' }
  }

  const onTrack = stats.onTrack ?? actualPerDay >= requiredPerDay

  if (onTrack) {
    return null
  }

  return { label: 'Behind pace', tone: 'behind' }
}

/**
 * Picks the challenge to feature on the overview.
 *
 * Only enabled lists whose stats are `active` or `overdue` qualify. The soonest
 * `dueDate` wins. When two lists share that date, the one behind pace comes
 * first. A list with no due date sorts after every dated list.
 *
 * @param cards - Challenge cards from `useWatchlistCards({ filter: 'challenge' })`
 * @returns The featured card, or null when none qualify
 */
export function pickChallengeSpotlight(cards: readonly WatchlistCard[]): null | WatchlistCard {
  const candidates = cards.filter(isChallengeSpotlightCandidate)

  if (candidates.length === 0) {
    return null
  }

  return [...candidates].sort(compareChallengeSpotlight)[0] ?? null
}

// Soonest due date, then a behind-pace list ahead of one that is on track.
function compareChallengeSpotlight(left: WatchlistCard, right: WatchlistCard): number {
  const byDueDate = compareDueDate(left.challenge?.dueDate, right.challenge?.dueDate)

  if (byDueDate !== 0) {
    return byDueDate
  }

  return Number(isBehindPace(right)) - Number(isBehindPace(left))
}

// Missing and unparseable dates sort after a real due date.
function compareDueDate(left: null | string | undefined, right: null | string | undefined): number {
  const leftTime = dueDateTime(left)
  const rightTime = dueDateTime(right)

  if (leftTime == null && rightTime == null) {
    return 0
  }

  if (leftTime == null) {
    return 1
  }

  if (rightTime == null) {
    return -1
  }

  return leftTime - rightTime
}

// Epoch milliseconds, or null when the due date is missing or not a date.
function dueDateTime(value: null | string | undefined): null | number {
  if (!value) {
    return null
  }

  const time = Date.parse(value)

  return Number.isNaN(time) ? null : time
}

// "12 days left". A missing or negative count is omitted.
function formatDaysLeft(daysRemaining: number | undefined): null | string {
  if (daysRemaining == null || !Number.isFinite(daysRemaining) || daysRemaining < 0) {
    return null
  }

  return `${formatDashboardQuantity(daysRemaining, 'day')} left`
}

// One decimal at most. Integers stay grouped without a trailing `.0`.
function formatPerWeek(requiredPerDay: number | undefined): null | string {
  if (requiredPerDay == null || !Number.isFinite(requiredPerDay)) {
    return null
  }

  const perWeek = Math.round(requiredPerDay * 7 * 10) / 10

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(perWeek)
}

// Overdue is behind. Otherwise an explicit `onTrack` wins, then the daily rate.
function isBehindPace(card: WatchlistCard): boolean {
  const stats = card.statsCache

  if (!stats) {
    return false
  }

  if (stats.status === 'overdue') {
    return true
  }

  if (stats.onTrack === false) {
    return true
  }

  if (stats.onTrack === true) {
    return false
  }

  const { actualPerDay, requiredPerDay } = stats

  if (actualPerDay == null || requiredPerDay == null) {
    return false
  }

  return actualPerDay < requiredPerDay
}

// Enabled challenges that are still in progress. Completed and not-started stay off the overview.
function isChallengeSpotlightCandidate(card: WatchlistCard): boolean {
  if (card.challenge?.enabled !== true) {
    return false
  }

  const status = card.statsCache?.status

  return status === 'active' || status === 'overdue'
}
