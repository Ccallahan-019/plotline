import type { MediaType } from '@plotline/shared/constants'

/** Kind stored on a row. `all` is a filter only. */
export type DashboardActivityFilterKind = Exclude<DashboardActivityKind, 'all'>

/**
 * Client filters for `GET /api/dashboard/activity`.
 *
 * `range` is `7d`, `30d`, `90d`, `year`, `all`, or one `YYYY-MM-DD` day.
 * `timeZone` is the IANA zone used for those day boundaries.
 */
export type DashboardActivityFilters = {
  cursor?: string
  kind?: DashboardActivityKind
  limit?: number
  mediaType?: DashboardActivityMediaType
  range?: string
  timeZone: string
}

/** One day header in the activity timeline. */
export type DashboardActivityGroup = {
  key: string
  label: string
  rows: DashboardActivityRow[]
}

/** Activity feed filter. `watched` includes dropped and on-hold rows. */
export type DashboardActivityKind =
  | 'all'
  | 'challenge'
  | 'milestone'
  | 'rated'
  | 'reviewed'
  | 'watched'

export type DashboardActivityMediaType = 'all' | MediaType

/** One page of the activity feed, newest first. */
export type DashboardActivityPage = {
  nextCursor: null | string
  rows: DashboardActivityRow[]
}

/**
 * How far back the activity feed looks.
 *
 * `rolling` is inclusive of today. `year` is the current calendar year in the
 * request timezone. `date` is one calendar day.
 */
export type DashboardActivityRange =
  | { date: string; type: 'date' }
  | { days: 30 | 7 | 90; type: 'rolling' }
  | { type: 'all' }
  | { type: 'year' }

/** One timeline row. `href` is null for milestones and rows without a title page. */
export type DashboardActivityRow = {
  detail: null | string
  filterKind: DashboardActivityFilterKind
  href: null | string
  id: string
  label: string
  mediaType: MediaType | null
  occurredAt: string
  posterPath: null | string
  rating: null | number
  title: string
  tmdbId: null | number
}

/** Lifetime average. `value` is null when the profile has no reviews. */
export type DashboardAverageStat = {
  series: number[]
  value: null | number
}

/** A year-scoped count or duration. `series` is January through December. */
export type DashboardCountStat = {
  series: number[]
  value: number
}

export type DashboardHeatmap = {
  activeDays: number
  busiestDay: DashboardHeatmapDay | null
  days: DashboardHeatmapDay[]
  longestStreak: number
  titlesThisYear: number
}

export type DashboardHeatmapDay = {
  count: number
  date: string
}

/** Poster returned for the overview recommendation card. */
export type DashboardRecommendationItem = {
  mediaType: MediaType
  posterPath: null | string
  title: string
  tmdbId: number
}

/**
 * Recommendation card payload.
 *
 * `reason` is null when the profile has no seed title, which is when the card stays hidden.
 * `rated` seeds are reviews of 7 or higher. `completed` is the fallback.
 */
export type DashboardRecommendations = {
  items: DashboardRecommendationItem[]
  reason: 'completed' | 'rated' | null
  seeds: DashboardRecommendationSeed[]
}

export type DashboardRecommendationSeed = {
  mediaType: MediaType
  rating: null | number
  title: string
  tmdbId: number
}

/** Streaks and lifetime totals for the overview sidebar. */
export type DashboardStreaks = {
  challengesCompleted: number
  currentStreak: number
  filmsCompleted: number
  lifetimeHours: number
}

/** Year summary for the overview stats, heatmap, and monthly chart. */
export type DashboardSummary = {
  heatmap: DashboardHeatmap
  stats: {
    avgRating: DashboardAverageStat
    hoursWatched: DashboardCountStat
    longestStreak: DashboardCountStat
    titlesWatched: DashboardCountStat
  }
  streaks: DashboardStreaks
  timeZone: string
  titlesPerMonth: DashboardTitlesPerMonth
  year: number
}

/** Client filters for `GET /api/dashboard/summary`. */
export type DashboardSummaryFilters = {
  timeZone: string
  year: number
}

/**
 * Twelve monthly title counts.
 *
 * `highlightMonth` is the current month index when `year` is this year, otherwise null.
 */
export type DashboardTitlesPerMonth = {
  counts: number[]
  highlightMonth: null | number
}

export type TrendingTitle = {
  /** TMDB backdrop path. Null when the title has no still. */
  backdropPath: null | string
  mediaType: MediaType
  /** Synopsis from TMDB. Null when the title has no overview. */
  overview: null | string
  posterPath: null | string
  /** Four-digit release year. Null when TMDB sent no usable date. */
  releaseYear: null | string
  title: string
  tmdbId: number
  /** TMDB vote average. Null when the title has no score. */
  voteAverage: null | number
}

/** Short mixed weekly trending list. Not invalidated with dashboard writes. */
export type TrendingTitles = {
  items: TrendingTitle[]
}
