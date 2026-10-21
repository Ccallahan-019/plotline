import type { LibraryItem, Media } from '@plotline/payload-types'
import type { MediaType } from '@plotline/shared/constants'
import type { WatchedEpisodePair } from '@plotline/shared/log-watch'

import { formatDistance } from 'date-fns'

import { formatDashboardQuantity } from '@/features/dashboard/services/format-dashboard'
import { getTvWatchProgress } from '@/features/media-detail/services/format-media-title'

import { episodeTitleLookup, type WatchedEpisodeLookup } from './episode-title'

const DAY_MS = 86_400_000
const FILM_PROGRESS_PERCENT = 50
const HERO_EYEBROW: Record<MediaType, string> = {
  movie: 'Up Next · Film',
  tv: 'Up Next · TV',
}
const STALLED_AFTER_DAYS = 14

/** Sort options for the also-in-progress list. */
export const CONTINUE_WATCHING_SORTS = ['last-watched', 'most-progress', 'almost-done'] as const

/** Counts for the All / TV / Film chips. Films are `movie` items. */
export type ContinueWatchingCounts = {
  all: number
  film: number
  tv: number
}

/** Featured watching title. `stalledLabel` is set only when this title is stalled. */
export type ContinueWatchingHero = {
  stalledLabel: null | string
} & ContinueWatchingItem

/** Lines under the continue-watching hero title. Null lines are omitted. */
export type ContinueWatchingHeroDetail = {
  episodeLabel: null | string
  lastWatchedLabel: null | string
  statusLabel: null | string
}

/**
 * One watching title.
 *
 * Films always report `percent` 50, the label `In Progress`, and null up-next
 * fields. TV uses `episodesWatched / episodeCount` when the catalog has a total,
 * and omits the percent when it does not. `upNextSeason` and `upNextEpisode` are
 * the next episode to log. `stalledDays` is set at 14 days since `lastWatchedAt`.
 */
export type ContinueWatchingItem = {
  contextLabel: string
  id: number
  lastWatchedAt: null | string
  logLabel: string
  mediaType: MediaType
  percent: null | number
  posterPath: null | string
  progressLabel: string
  stalledDays: null | number
  title: string
  tmdbId: number
  upNextEpisode: null | number
  upNextSeason: null | number
}

export type ContinueWatchingSort = (typeof CONTINUE_WATCHING_SORTS)[number]

export type ContinueWatchingTypeFilter = 'all' | MediaType

export type ContinueWatchingView = {
  alsoInProgress: ContinueWatchingItem[]
  counts: ContinueWatchingCounts
  hero: ContinueWatchingHero | null
}

/** One episode mark in the hero's season row. */
export type SeasonPip = {
  episode: number
  state: SeasonPipState
}

/** Season row for the hero, or absent when the season length is unknown. */
export type SeasonPipProgress = {
  episodeCount: number
  label: string
  pips: readonly SeasonPip[]
  watchedCount: number
}

/** Watched, current, or still-to-watch mark for one episode. */
export type SeasonPipState = 'unwatched' | 'up-next' | 'watched'

type SeasonEpisodeCount = {
  episodeCount: number
  season: number
}

/**
 * Count beside the also-in-progress heading.
 *
 * @param count - Titles in the filtered remainder, after the hero is removed
 * @returns Text such as `1 Title` or `7 Titles`
 */
export function alsoInProgressCountLabel(count: number): string {
  return formatDashboardQuantity(count, 'Title')
}

/**
 * Builds the continue-watching page model.
 *
 * The hero and the chip counts use the full watching set. A stalled hero is the
 * title whose `lastWatchedAt` is oldest among titles stalled for 14 days or more.
 * Otherwise the hero is the most recently watched title and has no stalled badge.
 * Filters and sorts apply only to the remaining rows.
 *
 * @param items - Rows from `toContinueWatchingItems`
 * @param options.mediaType - `movie`, `tv`, or `all` for the also-in-progress list
 * @param options.sort - Order of the also-in-progress list. Defaults to last watched
 * @returns The hero, the filtered remainder, and counts from the full set
 */
export function buildContinueWatchingView(
  items: readonly ContinueWatchingItem[],
  options?: {
    mediaType?: ContinueWatchingTypeFilter
    sort?: ContinueWatchingSort
  },
): ContinueWatchingView {
  const { hero, rest } = splitContinueWatchingHero(items)
  const mediaType = options?.mediaType ?? 'all'

  return {
    alsoInProgress: sortContinueWatchingItems(
      filterContinueWatchingItems(rest, mediaType),
      options?.sort ?? 'last-watched',
    ),
    counts: countContinueWatchingItems(items),
    hero,
  }
}

/**
 * Season and episode a continue-watching title can name from TMDB.
 *
 * Films and series without a next episode return null.
 *
 * @param item - Watching title, using its up-next season and episode
 * @returns Coordinates for a season-details lookup, or null when there is no next episode
 */
export function continueWatchingEpisodeLookup(
  item: Pick<ContinueWatchingItem, 'mediaType' | 'tmdbId' | 'upNextEpisode' | 'upNextSeason'>,
): null | WatchedEpisodeLookup {
  return episodeTitleLookup({
    episode: item.upNextEpisode,
    mediaType: item.mediaType,
    season: item.upNextSeason,
    tmdbId: item.tmdbId,
  })
}

/**
 * Copy under the continue-watching hero title.
 *
 * A film shows `In Progress` and no watched time. A series shows the next
 * episode (`S3 · E9`) and how long ago it was watched.
 *
 * @param item - Hero fields the copy reads
 * @param now - Instant the relative watched time is measured from
 * @returns The episode line, the film status, and the last-watched line
 */
export function continueWatchingHeroDetail(
  item: Pick<
    ContinueWatchingItem,
    'lastWatchedAt' | 'mediaType' | 'progressLabel' | 'upNextEpisode' | 'upNextSeason'
  >,
  now: Date,
): ContinueWatchingHeroDetail {
  if (item.mediaType === 'movie') {
    return {
      episodeLabel: null,
      lastWatchedLabel: null,
      statusLabel: item.progressLabel,
    }
  }

  return {
    episodeLabel: formatUpNextEpisodeLabel(item.upNextSeason, item.upNextEpisode),
    lastWatchedLabel: formatLastWatchedLabel(item.lastWatchedAt, now),
    statusLabel: null,
  }
}

/**
 * Eyebrow above the continue-watching hero title.
 *
 * @param mediaType - `movie` or `tv`
 * @returns `Up Next · Film` or `Up Next · TV`
 */
export function continueWatchingHeroEyebrow(mediaType: MediaType): string {
  return HERO_EYEBROW[mediaType]
}

/**
 * Counts films and series in the full watching set.
 *
 * @param items - Continue-watching rows before hero selection or filtering
 * @returns Totals for the All, TV, and Film chips
 */
export function countContinueWatchingItems(
  items: readonly ContinueWatchingItem[],
): ContinueWatchingCounts {
  let film = 0
  let tv = 0

  for (const item of items) {
    if (item.mediaType === 'movie') {
      film += 1
    } else {
      tv += 1
    }
  }

  return { all: items.length, film, tv }
}

/**
 * Keeps rows of one media type.
 *
 * @param items - Rows to filter
 * @param mediaType - `all` returns every row
 * @returns A new array of matching rows, in input order
 */
export function filterContinueWatchingItems(
  items: readonly ContinueWatchingItem[],
  mediaType: ContinueWatchingTypeFilter,
): ContinueWatchingItem[] {
  if (mediaType === 'all') {
    return [...items]
  }

  return items.filter((item) => item.mediaType === mediaType)
}

/**
 * Compact relative time for an also-in-progress row.
 *
 * @param lastWatchedAt - Last watch timestamp, or null
 * @param now - Instant the distance is measured from
 * @returns Text such as `3 days ago`, or null when the timestamp is missing
 */
export function formatContinueWatchingRelativeTime(
  lastWatchedAt: null | string,
  now: Date,
): null | string {
  const watchedAt = watchedAtTime(lastWatchedAt)

  if (watchedAt == null) {
    return null
  }

  return formatDistance(watchedAt, now, { addSuffix: true })
}

/**
 * Season pips for the up-next season on the continue-watching hero.
 *
 * The season length comes from `seasonEpisodeCounts`. When that season is
 * missing or not a positive length, the hero skips the pips. A pip is watched
 * when a pair matches the season and falls inside `1..episodeCount`. The
 * up-next episode is marked separately unless that episode is already watched.
 *
 * @param options.episode - Up-next episode number
 * @param options.season - Up-next season number
 * @param options.seasonEpisodeCounts - Per-season lengths from catalog metadata
 * @param options.watched - Distinct watched pairs for the library item
 * @returns The pip row and its label, or null when the season length is unknown
 */
export function seasonPipProgress(options: {
  episode: number
  season: number
  seasonEpisodeCounts?: null | readonly SeasonEpisodeCount[]
  watched: readonly WatchedEpisodePair[]
}): null | SeasonPipProgress {
  const episodeCount = seasonEpisodeCount(options.seasonEpisodeCounts, options.season)

  if (episodeCount == null) {
    return null
  }

  const watchedEpisodes = watchedEpisodesInSeason(options.watched, options.season, episodeCount)

  return {
    episodeCount,
    label: `Season ${options.season} · ${watchedEpisodes.size} of ${episodeCount} watched`,
    pips: Array.from({ length: episodeCount }, (_, index) =>
      seasonPip(index + 1, options.episode, watchedEpisodes),
    ),
    watchedCount: watchedEpisodes.size,
  }
}

/**
 * Sorts a copy of the also-in-progress rows.
 *
 * Last watched uses `lastWatchedAt` descending. Most progress ranks TV by percent
 * and films at 50%. Almost done ranks TV by percent and places films last.
 * Equal ranks fall back to the more recently watched title.
 *
 * @param items - Rows to sort
 * @param sort - Which comparison to use
 * @returns A new sorted array
 */
export function sortContinueWatchingItems(
  items: readonly ContinueWatchingItem[],
  sort: ContinueWatchingSort,
): ContinueWatchingItem[] {
  return [...items].sort((left, right) => compareContinueWatching(left, right, sort))
}

/**
 * Maps watching library items into continue-watching rows.
 *
 * Items whose media is only an id, or whose title is blank, are left out.
 *
 * @param items - Library items, normally the watching list
 * @param now - Instant used to decide which rows are stalled
 * @returns One view-model row per displayable item, in input order
 */
export function toContinueWatchingItems(
  items: readonly LibraryItem[],
  now: Date,
): ContinueWatchingItem[] {
  const rows: ContinueWatchingItem[] = []

  for (const item of items) {
    const row = toContinueWatchingItem(item, now)

    if (row) {
      rows.push(row)
    }
  }

  return rows
}

// Films sort after every series, including series with no known percent (rank 0).
// A finite rank keeps two films equal instead of subtracting infinities into NaN.
function almostDoneRank(item: ContinueWatchingItem): number {
  if (item.mediaType === 'movie') {
    return -1
  }

  return item.percent ?? 0
}

// Most-progress percent: films take the fixed 50% bar, TV without a total takes 0.
function compareContinueWatching(
  left: ContinueWatchingItem,
  right: ContinueWatchingItem,
  sort: ContinueWatchingSort,
): number {
  const rank = compareSortRank(left, right, sort)

  if (rank !== 0) {
    return rank
  }

  return compareLastWatched(left, right, 'desc')
}

// Null watch times sort after any real timestamp.
function compareLastWatched(
  left: ContinueWatchingItem,
  right: ContinueWatchingItem,
  direction: 'asc' | 'desc',
): number {
  const leftTime = watchedAtTime(left.lastWatchedAt)
  const rightTime = watchedAtTime(right.lastWatchedAt)

  if (leftTime == null && rightTime == null) {
    return direction === 'desc' ? right.id - left.id : left.id - right.id
  }

  if (leftTime == null) {
    return 1
  }

  if (rightTime == null) {
    return -1
  }

  if (leftTime !== rightTime) {
    return direction === 'desc' ? rightTime - leftTime : leftTime - rightTime
  }

  return direction === 'desc' ? right.id - left.id : left.id - right.id
}

// Primary key for a sort. Zero lets the last-watched tie break decide.
function compareSortRank(
  left: ContinueWatchingItem,
  right: ContinueWatchingItem,
  sort: ContinueWatchingSort,
): number {
  switch (sort) {
    case 'almost-done':
      return almostDoneRank(right) - almostDoneRank(left)
    case 'last-watched':
      return 0
    case 'most-progress':
      return progressRank(right) - progressRank(left)
    default: {
      const exhaustive: never = sort

      return exhaustive
    }
  }
}

// Row subtitle: `Film · In Progress`, `TV · Next: S4 E2`, or `TV` without a next episode.
function continueWatchingContextLabel(
  mediaType: MediaType,
  season: null | number,
  episode: null | number,
): string {
  if (mediaType === 'movie') {
    return 'Film · In Progress'
  }

  if (season == null || episode == null) {
    return 'TV'
  }

  return `TV · Next: S${season} E${episode}`
}

// Films, and series with no next episode, use `Log Watch`.
function continueWatchingLogLabel(
  mediaType: MediaType,
  season: null | number,
  episode: null | number,
): string {
  if (mediaType === 'tv' && season != null && episode != null) {
    return `Log S${season} E${episode}`
  }

  return 'Log Watch'
}

// `Last watched 3 days ago`, or null when the timestamp is missing.
function formatLastWatchedLabel(lastWatchedAt: null | string, now: Date): null | string {
  const relative = formatContinueWatchingRelativeTime(lastWatchedAt, now)

  if (relative == null) {
    return null
  }

  return `Last watched ${relative}`
}

// Hero episode line, such as `S3 · E9`.
function formatUpNextEpisodeLabel(season: null | number, episode: null | number): null | string {
  if (season == null || episode == null) {
    return null
  }

  return `S${season} · E${episode}`
}

// Populated media, when the library relation was loaded with depth.
function populatedMedia(media: LibraryItem['media']): Media | null {
  return typeof media === 'object' ? media : null
}

// TV percent, or 50 for a film. Missing TV totals rank as no progress.
function progressRank(item: ContinueWatchingItem): number {
  if (item.mediaType === 'movie') {
    return FILM_PROGRESS_PERCENT
  }

  return item.percent ?? 0
}

// Positive episode count for one season, or null when the catalog does not know it.
function seasonEpisodeCount(
  seasonEpisodeCounts: null | readonly SeasonEpisodeCount[] | undefined,
  season: number,
): null | number {
  const match = seasonEpisodeCounts?.find((entry) => entry.season === season)

  if (match == null || match.episodeCount <= 0) {
    return null
  }

  return match.episodeCount
}

// One pip. An already watched up-next episode stays watched.
function seasonPip(
  episode: number,
  upNextEpisode: number,
  watchedEpisodes: ReadonlySet<number>,
): SeasonPip {
  if (watchedEpisodes.has(episode)) {
    return { episode, state: 'watched' }
  }

  if (episode === upNextEpisode) {
    return { episode, state: 'up-next' }
  }

  return { episode, state: 'unwatched' }
}

// Hero plus the other rows, preserving the original order of the remainder.
function splitContinueWatchingHero(items: readonly ContinueWatchingItem[]): {
  hero: ContinueWatchingHero | null
  rest: ContinueWatchingItem[]
} {
  if (items.length === 0) {
    return { hero: null, rest: [] }
  }

  const stalled = items.filter((item) => item.stalledDays != null)
  const heroSource =
    stalled.length > 0
      ? [...stalled].sort((left, right) => compareLastWatched(left, right, 'asc'))[0]
      : [...items].sort((left, right) => compareLastWatched(left, right, 'desc'))[0]

  if (!heroSource) {
    return { hero: null, rest: [...items] }
  }

  return {
    hero: {
      ...heroSource,
      stalledLabel: heroSource.stalledDays == null ? null : `Stalled · ${heroSource.stalledDays}d`,
    },
    rest: items.filter((item) => item.id !== heroSource.id),
  }
}

// Whole days since the last watch, once the stalled threshold is reached.
function stalledDaysSince(lastWatchedAt: null | string, now: Date): null | number {
  const watchedAt = watchedAtTime(lastWatchedAt)

  if (watchedAt == null) {
    return null
  }

  const days = Math.floor((now.getTime() - watchedAt) / DAY_MS)

  if (days < STALLED_AFTER_DAYS) {
    return null
  }

  return days
}

// One library item, or null when the row cannot show a title.
function toContinueWatchingItem(item: LibraryItem, now: Date): ContinueWatchingItem | null {
  const media = populatedMedia(item.media)

  if (!media || !media.title.trim() || media.tmdbId <= 0) {
    return null
  }

  const lastWatchedAt = item.lastWatchedAt ?? null
  const shared = {
    id: item.id,
    lastWatchedAt,
    mediaType: media.mediaType,
    posterPath: media.posterPath ?? null,
    stalledDays: stalledDaysSince(lastWatchedAt, now),
    title: media.title,
    tmdbId: media.tmdbId,
  }

  if (media.mediaType === 'movie') {
    return {
      ...shared,
      contextLabel: continueWatchingContextLabel('movie', null, null),
      logLabel: continueWatchingLogLabel('movie', null, null),
      percent: FILM_PROGRESS_PERCENT,
      progressLabel: 'In Progress',
      upNextEpisode: null,
      upNextSeason: null,
    }
  }

  const episodesWatched = item.progress?.episodesWatched ?? 0
  const episodeCount = media.tvMeta?.episodeCount
  const hasTotal = episodeCount != null && episodeCount > 0
  const percent = hasTotal
    ? Math.min(100, Math.round((episodesWatched / episodeCount) * 100))
    : null
  const upNext = getTvWatchProgress({
    episodeCount,
    episodesWatched,
    lastEpisode: item.progress?.lastEpisode,
    lastSeason: item.progress?.lastSeason,
    media,
    seasonsCompleted: item.progress?.seasonsCompleted,
    status: item.status,
  })

  const upNextEpisode = upNext?.upNextEpisode ?? null
  const upNextSeason = upNext?.upNextSeason ?? null

  return {
    ...shared,
    contextLabel: continueWatchingContextLabel('tv', upNextSeason, upNextEpisode),
    logLabel: continueWatchingLogLabel('tv', upNextSeason, upNextEpisode),
    percent,
    progressLabel: hasTotal
      ? `${episodesWatched} / ${episodeCount} eps · ${percent}%`
      : `${episodesWatched} eps`,
    upNextEpisode,
    upNextSeason,
  }
}

// Epoch milliseconds, or null when the timestamp is missing or invalid.
function watchedAtTime(value: null | string): null | number {
  if (!value) {
    return null
  }

  const time = Date.parse(value)

  return Number.isNaN(time) ? null : time
}

// Distinct episode numbers in one season, ignoring pairs outside `1..episodeCount`.
function watchedEpisodesInSeason(
  watched: readonly WatchedEpisodePair[],
  season: number,
  episodeCount: number,
): Set<number> {
  const episodes = new Set<number>()

  for (const pair of watched) {
    if (pair.season === season && pair.episode >= 1 && pair.episode <= episodeCount) {
      episodes.add(pair.episode)
    }
  }

  return episodes
}
