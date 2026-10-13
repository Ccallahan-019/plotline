import type { LibraryItem, Media } from '@plotline/payload-types'
import type { MediaType } from '@plotline/shared/constants'

import { getTvWatchProgress } from '@/features/media-detail/services/format-media-title'

const DAY_MS = 86_400_000
const FILM_PROGRESS_PERCENT = 50
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

/**
 * One watching title.
 *
 * Films always report `percent` 50 and the label `In progress`. TV uses
 * `episodesWatched / episodeCount` when the catalog has a total, and omits the
 * percent when it does not. `stalledDays` is set at 14 days since `lastWatchedAt`.
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
}

export type ContinueWatchingSort = (typeof CONTINUE_WATCHING_SORTS)[number]

export type ContinueWatchingTypeFilter = 'all' | MediaType

export type ContinueWatchingView = {
  alsoInProgress: ContinueWatchingItem[]
  counts: ContinueWatchingCounts
  hero: ContinueWatchingHero | null
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

// Films sort after every series, including series with no known percent.
function almostDoneRank(item: ContinueWatchingItem): number {
  if (item.mediaType === 'movie') {
    return Number.NEGATIVE_INFINITY
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
      stalledLabel:
        heroSource.stalledDays == null ? null : `Stalled · ${heroSource.stalledDays}d`,
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
      contextLabel: 'Film · In progress',
      logLabel: 'Log as watched',
      percent: FILM_PROGRESS_PERCENT,
      progressLabel: 'In progress',
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

  return {
    ...shared,
    contextLabel: upNext
      ? `TV · Next: S${upNext.upNextSeason} E${upNext.upNextEpisode}`
      : 'TV',
    logLabel: upNext ? `Log S${upNext.upNextSeason} E${upNext.upNextEpisode}` : 'Log as watched',
    percent,
    progressLabel: hasTotal
      ? `${episodesWatched} / ${episodeCount} eps · ${percent}%`
      : `${episodesWatched} eps`,
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
