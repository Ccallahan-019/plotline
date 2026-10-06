import type { MediaStatus } from '../constants/media'
import type { PriorCompletionRule } from '../constants/watchlist-challenge'
import type {
  StatsLibraryItem,
  StatsMedia,
  StatsMembershipInput,
  WatchlistChallengeConfig,
} from './types'

import { isMembershipEligibleForTvRule } from './applyTvCountRule'

export function computeEpisodesCountedForList(input: {
  addedAt: string
  episodesAtJoin?: null | number
  libraryItem: StatsLibraryItem
}): number {
  const episodesWatched = input.libraryItem.progress?.episodesWatched ?? 0
  const episodesAtJoin = input.episodesAtJoin ?? episodesWatched

  return Math.max(0, episodesWatched - episodesAtJoin)
}

export function computeMembershipGoalWeight(input: {
  challenge?: null | WatchlistChallengeConfig
  episodesCountedForList?: null | number
  libraryItem: StatsLibraryItem
  media: StatsMedia
}): number {
  const goalType = input.challenge?.goalType ?? 'count'
  const tvCountRule = input.challenge?.tvCountRule ?? 'tv_as_series'

  if (goalType === 'runtime_minutes') {
    const runtime = input.media.runtime ?? 0

    if (input.media.mediaType === 'movie') {
      return runtime
    }

    return (input.episodesCountedForList ?? 0) * runtime
  }

  if (input.media.mediaType === 'movie') {
    return 1
  }

  switch (tvCountRule) {
    case 'movies_only':
      return 0
    case 'tv_by_episode':
      return input.episodesCountedForList ?? 0
    case 'tv_by_season':
      return input.libraryItem.progress?.seasonsCompleted?.length ?? 0
    case 'tv_as_series':
    default:
      return 1
  }
}

export function deriveMembershipChallengeFields(input: {
  addedAt: string
  challenge?: null | WatchlistChallengeConfig
  episodesAtJoin?: null | number
  libraryItem: StatsLibraryItem
  media: StatsMedia
}): Pick<
  StatsMembershipInput,
  'countsTowardGoal' | 'episodesCountedForList' | 'goalWeight' | 'listStatus'
> {
  const tvCountRule = input.challenge?.tvCountRule ?? 'tv_as_series'
  const priorCompletionRule = input.challenge?.priorCompletionRule
  const episodesCountedForList = computeEpisodesCountedForList({
    addedAt: input.addedAt,
    episodesAtJoin: input.episodesAtJoin,
    libraryItem: input.libraryItem,
  })

  const membership: StatsMembershipInput = {
    addedAt: input.addedAt,
    countsTowardGoal: true,
    episodesCountedForList,
    goalWeight: 1,
    libraryItem: input.libraryItem,
    listStatus: mapLibraryStatusToListStatus(input.libraryItem.status),
    media: input.media,
  }

  const tvEligible = isMembershipEligibleForTvRule(membership, tvCountRule)
  const priorEligible = shouldCountPriorCompletion({
    addedAt: input.addedAt,
    libraryItem: input.libraryItem,
    priorCompletionRule,
  })

  membership.countsTowardGoal = tvEligible && priorEligible
  membership.goalWeight = computeMembershipGoalWeight({
    challenge: input.challenge,
    episodesCountedForList,
    libraryItem: input.libraryItem,
    media: input.media,
  })

  if (membership.listStatus === 'completed' && membership.countsTowardGoal === false) {
    membership.listStatus = 'planned'
  }

  return {
    countsTowardGoal: membership.countsTowardGoal,
    episodesCountedForList,
    goalWeight: membership.goalWeight,
    listStatus: membership.listStatus,
  }
}

export function mapLibraryStatusToListStatus(
  libraryStatus: MediaStatus,
): 'completed' | 'in_progress' | 'planned' {
  switch (libraryStatus) {
    case 'completed':
      return 'completed'
    case 'watching':
      return 'in_progress'
    default:
      return 'planned'
  }
}

export function shouldCountPriorCompletion(input: {
  addedAt: string
  libraryItem: StatsLibraryItem
  priorCompletionRule: null | PriorCompletionRule | undefined
}): boolean {
  const rule = input.priorCompletionRule ?? 'exclude_if_already_completed'

  if (input.libraryItem.status !== 'completed') {
    return true
  }

  const completedAt = parseTimestamp(input.libraryItem.completedAt)
  const addedAt = parseTimestamp(input.addedAt)

  switch (rule) {
    case 'count_all_on_join':
      return true
    case 'count_if_completed_after_join':
      if (completedAt == null || addedAt == null) {
        return false
      }

      return completedAt > addedAt
    case 'exclude_if_already_completed':
    default:
      if (completedAt == null || addedAt == null) {
        return false
      }

      return completedAt >= addedAt
  }
}

function parseTimestamp(value: null | string | undefined): null | number {
  if (!value) {
    return null
  }

  const time = Date.parse(value)

  return Number.isNaN(time) ? null : time
}
