import type { MediaStatus, MediaType } from '../constants/media'
import type {
  ChallengeGoalType,
  ChallengeStatsStatus,
  ListStatus,
  PriorCompletionRule,
  TvCountRule,
} from '../constants/watchlist-challenge'

export interface ComputeWatchlistStatsInput {
  challenge?: null | WatchlistChallengeConfig
  memberships: StatsMembershipInput[]
  /** Completion latch from the stored cache. Reopen keeps it when the list is already fully watched. */
  previousStats?: null | Pick<WatchlistStatsCache, 'completedAt' | 'completedTitleCount'>
  referenceDate?: Date
  /**
   * Measure a latched list-size goal live again.
   * A list that is already fully watched keeps the stored finish.
   */
  reopenCompletion?: boolean
  watchlistCreatedAt?: string
}

export interface StatsLibraryItem {
  completedAt?: null | string
  progress?: null | StatsLibraryItemProgress
  /** Times this title was rewatched. Movies increment it; TV leaves it unset. */
  rewatchCount?: null | number
  status: MediaStatus
}

export interface StatsLibraryItemProgress {
  episodesWatched?: null | number
  seasonsCompleted?: null | number[]
  type: MediaType
}

export interface StatsMedia {
  mediaType: MediaType
  runtime?: null | number
  tvMeta?: {
    episodeCount?: null | number
  } | null
}

export interface StatsMembershipInput {
  addedAt: string
  completedForListAt?: null | string
  countsTowardGoal?: boolean | null
  episodesCountedForList?: null | number
  goalWeight?: null | number
  libraryItem: StatsLibraryItem
  listStatus?: ListStatus | null
  media: StatsMedia
}

export interface WatchlistChallengeConfig {
  dueDate?: null | string
  enabled?: boolean | null
  goalCount?: null | number
  goalRuntimeMinutes?: null | number
  goalType?: ChallengeGoalType | null
  includeRewatches?: boolean | null
  priorCompletionRule?: null | PriorCompletionRule
  startDate?: null | string
  tvCountRule?: null | TvCountRule
}

export interface WatchlistStatsCache {
  actualPerDay?: number
  completed: number
  /** When a list-size challenge first finished. Kept until the user reopens it. */
  completedAt?: string
  completedRuntimeMinutes?: number
  /** Titles on the list when the latch was set. Progress reads `n of n` while latched. */
  completedTitleCount?: number
  daysElapsed?: number
  daysRemaining?: number
  daysTotal?: number
  goalCount?: number
  goalRuntimeMinutes?: number
  inProgress: number
  lastCalculatedAt: string
  /** Qualifying titles added after `completedAt`. Set only while latched. */
  newTitlesSinceCompletion?: number
  onTrack?: boolean
  percentComplete: number
  projectedFinishDate?: string
  remaining: number
  remainingRuntimeMinutes?: number
  requiredPerDay?: number
  status?: ChallengeStatsStatus
  totalEligible: number
  /** Added titles that are not completed. Reopen is offered only when this is above zero. */
  unfinishedTitlesSinceCompletion?: number
}
