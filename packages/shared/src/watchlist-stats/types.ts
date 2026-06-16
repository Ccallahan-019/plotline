import type { MediaStatus, MediaType } from "../constants/media";
import type {
  ChallengeGoalType,
  ChallengeStatsStatus,
  ListStatus,
  PriorCompletionRule,
  TvCountRule,
} from "../constants/watchlist-challenge";

export interface ComputeWatchlistStatsInput {
  challenge?: null | WatchlistChallengeConfig;
  memberships: StatsMembershipInput[];
  referenceDate?: Date;
  watchlistCreatedAt?: string;
}

export interface StatsLibraryItem {
  completedAt?: null | string;
  progress?: null | StatsLibraryItemProgress;
  status: MediaStatus;
}

export interface StatsLibraryItemProgress {
  episodesWatched?: null | number;
  seasonsCompleted?: null | number[];
  type: MediaType;
}

export interface StatsMedia {
  mediaType: MediaType;
  runtime?: null | number;
  tvMeta?: {
    episodeCount?: null | number;
  } | null;
}

export interface StatsMembershipInput {
  addedAt: string;
  completedForListAt?: null | string;
  countsTowardGoal?: boolean | null;
  episodesCountedForList?: null | number;
  goalWeight?: null | number;
  libraryItem: StatsLibraryItem;
  listStatus?: ListStatus | null;
  media: StatsMedia;
}

export interface WatchlistChallengeConfig {
  dueDate?: null | string;
  enabled?: boolean | null;
  goalCount?: null | number;
  goalRuntimeMinutes?: null | number;
  goalType?: ChallengeGoalType | null;
  includeRewatches?: boolean | null;
  priorCompletionRule?: null | PriorCompletionRule;
  startDate?: null | string;
  tvCountRule?: null | TvCountRule;
}

export interface WatchlistStatsCache {
  actualPerDay?: number;
  completed: number;
  completedRuntimeMinutes?: number;
  daysElapsed?: number;
  daysRemaining?: number;
  daysTotal?: number;
  goalCount?: number;
  goalRuntimeMinutes?: number;
  inProgress: number;
  lastCalculatedAt: string;
  onTrack?: boolean;
  percentComplete: number;
  projectedFinishDate?: string;
  remaining: number;
  remainingRuntimeMinutes?: number;
  requiredPerDay?: number;
  status?: ChallengeStatsStatus;
  totalEligible: number;
}
