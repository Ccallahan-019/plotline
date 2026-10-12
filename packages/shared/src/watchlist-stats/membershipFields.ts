import type { MediaStatus } from '../constants/media'
import type { PriorCompletionRule } from '../constants/watchlist-challenge'
import type {
  StatsLibraryItem,
  StatsMedia,
  StatsMembershipInput,
  WatchlistChallengeConfig,
} from './types'

import { isMembershipEligibleForTvRule } from './applyTvCountRule'

export type MembershipRuleEligibility = {
  /** Later rewatch of a title whose first completion is strictly before join. */
  preJoinRewatch: boolean
  priorEligible: boolean
  /** `includeRewatches` opened the pre-join rewatch path. */
  rewatchQualifies: boolean
  /** TV rule and either the prior-completion rule or a qualifying rewatch. */
  ruleEligible: boolean
  tvEligible: boolean
}

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

/**
 * Derives list-scoped challenge fields from the library item and watchlist rules.
 *
 * `countsTowardGoal` is rule eligibility combined with `excludeFromGoal`. The prior-completion
 * rule still decides a finish from before join. `includeRewatches` only opens a later rewatch
 * of that title, and only while challenge mode is on. Callers keep `excludeFromGoal` themselves.
 *
 * @param input.addedAt - When the title joined the list
 * @param input.challenge - Watchlist challenge config; omitted rules use the collection defaults
 * @param input.episodesAtJoin - Episode baseline; defaults to the library item's current count
 * @param input.excludeFromGoal - Manual opt-out. `true` forces `countsTowardGoal` off
 * @param input.libraryItem - Library status, completion time, progress, and rewatch count
 * @param input.media - Media type and runtime used for TV rules and goal weight
 * @returns Membership fields ready to persist
 */
export function deriveMembershipChallengeFields(input: {
  addedAt: string
  challenge?: null | WatchlistChallengeConfig
  episodesAtJoin?: null | number
  excludeFromGoal?: boolean | null
  libraryItem: StatsLibraryItem
  media: StatsMedia
}): Pick<
  StatsMembershipInput,
  'countsTowardGoal' | 'episodesCountedForList' | 'goalWeight' | 'listStatus'
> {
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

  const { ruleEligible } = resolveMembershipRuleEligibility(input)

  membership.countsTowardGoal = ruleEligible && input.excludeFromGoal !== true
  membership.goalWeight = computeMembershipGoalWeight({
    challenge: input.challenge,
    episodesCountedForList,
    libraryItem: input.libraryItem,
    media: input.media,
  })

  // A completion that does not count must not stay `completed` for list stats.
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

/**
 * Splits TV, prior-completion, and rewatch rules so counts and exclusion copy stay aligned.
 *
 * A pre-join rewatch counts only when challenge mode is on and `includeRewatches` is true.
 * That path does not undo a prior-completion rule that already counts the title, and it does
 * not apply when challenge mode is off.
 *
 * @param input.addedAt - When the title joined the list
 * @param input.challenge - Watchlist challenge config
 * @param input.libraryItem - Library status, completion time, and rewatch count
 * @param input.media - Media type used by the TV counting rule
 * @returns Which rules pass, and whether the title is eligible before manual exclusion
 */
export function resolveMembershipRuleEligibility(input: {
  addedAt: string
  challenge?: null | WatchlistChallengeConfig
  libraryItem: StatsLibraryItem
  media: StatsMedia
}): MembershipRuleEligibility {
  const tvEligible = isMembershipEligibleForTvRule(
    {
      addedAt: input.addedAt,
      libraryItem: input.libraryItem,
      media: input.media,
    },
    input.challenge?.tvCountRule,
  )
  const priorEligible = shouldCountPriorCompletion({
    addedAt: input.addedAt,
    libraryItem: input.libraryItem,
    priorCompletionRule: input.challenge?.priorCompletionRule,
  })
  const preJoinRewatch = isRewatchOfTitleFinishedBeforeJoin(input.addedAt, input.libraryItem)
  const rewatchQualifies =
    input.challenge?.enabled === true && input.challenge.includeRewatches === true && preJoinRewatch

  return {
    preJoinRewatch,
    priorEligible,
    rewatchQualifies,
    ruleEligible: tvEligible && (priorEligible || rewatchQualifies),
    tvEligible,
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

// First completion is strictly before join, and the library item has been rewatched since.
function isRewatchOfTitleFinishedBeforeJoin(
  addedAt: string,
  libraryItem: StatsLibraryItem,
): boolean {
  if ((libraryItem.rewatchCount ?? 0) <= 0) {
    return false
  }

  const completedAt = parseTimestamp(libraryItem.completedAt)
  const joinedAt = parseTimestamp(addedAt)

  if (completedAt == null || joinedAt == null) {
    return false
  }

  return completedAt < joinedAt
}

function parseTimestamp(value: null | string | undefined): null | number {
  if (!value) {
    return null
  }

  const time = Date.parse(value)

  return Number.isNaN(time) ? null : time
}
