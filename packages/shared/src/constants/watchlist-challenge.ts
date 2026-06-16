/**
 * Challenge-mode watchlist enums mirrored in Payload collection configs.
 */

export const LIST_STATUSES = [
  "planned",
  "in_progress",
  "completed",
  "skipped",
] as const;

export type ListStatus = (typeof LIST_STATUSES)[number];

export const CHALLENGE_GOAL_TYPES = ["count", "runtime_minutes"] as const;

export type ChallengeGoalType = (typeof CHALLENGE_GOAL_TYPES)[number];

export const TV_COUNT_RULES = [
  "movies_only",
  "tv_as_series",
  "tv_by_episode",
  "tv_by_season",
] as const;

export type TvCountRule = (typeof TV_COUNT_RULES)[number];

export const PRIOR_COMPLETION_RULES = [
  "exclude_if_already_completed",
  "count_if_completed_after_join",
  "count_all_on_join",
] as const;

export type PriorCompletionRule = (typeof PRIOR_COMPLETION_RULES)[number];

export const CHALLENGE_STATS_STATUSES = [
  "not_started",
  "active",
  "completed",
  "overdue",
] as const;

export type ChallengeStatsStatus = (typeof CHALLENGE_STATS_STATUSES)[number];
