import type { LibraryItem } from '@plotline/payload-types'
import type { QueryClient, QueryKey } from '@tanstack/react-query'

import {
  isMovieRewatch,
  isTvEpisodeRewatch,
  toWatchedEpisodeKey,
  toWatchedEpisodeKeySet,
  type WatchedEpisodePair,
} from '@plotline/shared/log-watch'

import type { LibraryItemsResponse } from '../../library-grid/types'
import type { LogWatchBatchInput, LogWatchInput } from '../../types/mutations'

import { watchedEpisodeQueryKeys } from '../../watch-events/services/query-keys'

export type WatchedEpisodeQuerySnapshot = Array<[QueryKey, WatchedEpisodePair[]]>

type LoggedTvEpisodeInput = {
  episodes?: ReadonlyArray<{ episode: number; season: number }>
  tvContext?: {
    episode?: number
    season?: number
  }
}

const EMPTY_WATCHED_EPISODE_KEYS: ReadonlySet<string> = new Set()

/**
 * Appends newly logged TV pairs onto loaded watched-episodes caches for this title.
 *
 * The library-item patch has to run first: it still needs the prior key set so
 * `episodesWatched` can count a first watch. Queries that have not loaded are left
 * alone, so a partial list does not stand in for unknown coverage. A rewatch or a
 * repeated pair is not inserted.
 *
 * @param queryClient - Client holding library and watched-episodes queries
 * @param mediaId - Media id from the log-watch payload
 * @param logged - Season/episode pairs in this payload
 * @returns Previous cache values for queries this call replaced
 */
export function applyOptimisticWatchedEpisodes(
  queryClient: QueryClient,
  mediaId: number | string,
  logged: readonly WatchedEpisodePair[],
): WatchedEpisodeQuerySnapshot {
  if (logged.length === 0) {
    return []
  }

  const previous: WatchedEpisodeQuerySnapshot = []

  for (const libraryItemId of libraryItemIdsForMedia(queryClient, mediaId)) {
    const queryKey = watchedEpisodeQueryKeys.forLibraryItem(libraryItemId)
    const current = queryClient.getQueryData<WatchedEpisodePair[]>(queryKey)

    if (current == null) {
      continue
    }

    const next = appendWatchedEpisodes(current, logged)

    if (next === current) {
      continue
    }

    previous.push([queryKey, current])
    queryClient.setQueryData(queryKey, next)
  }

  return previous
}

/**
 * Watched-episode keys already cached for a library item.
 *
 * An empty set means the log-watch query has not loaded coverage yet. Completed shows
 * are still treated as fully watched via library-item status.
 *
 * @param queryClient - Client holding the watched-episodes query
 * @param libraryItemId - Library item whose coverage cache to read
 * @returns A `season:episode` key set, empty when the query has no data
 */
export function cachedWatchedEpisodeKeys(
  queryClient: QueryClient,
  libraryItemId: number,
): ReadonlySet<string> {
  const episodes =
    queryClient.getQueryData<WatchedEpisodePair[]>(
      watchedEpisodeQueryKeys.forLibraryItem(libraryItemId),
    ) ?? []

  return toWatchedEpisodeKeySet(episodes)
}

/**
 * TV season/episode pairs in a single or batch log-watch payload.
 *
 * A movie log has neither `episodes` nor a complete `tvContext`, so it returns an
 * empty list. A batch payload is taken from `episodes` when that field is present.
 *
 * @param input - Log-watch mutation variables
 * @returns Pairs to add to the watched-episodes cache, in payload order
 */
export function loggedTvEpisodes(input: LoggedTvEpisodeInput): WatchedEpisodePair[] {
  if (input.episodes != null) {
    return input.episodes.map((episode) => ({
      episode: episode.episode,
      season: episode.season,
    }))
  }

  const episode = input.tvContext?.episode
  const season = input.tvContext?.season

  if (season == null || episode == null) {
    return []
  }

  return [{ episode, season }]
}

/**
 * True when the cached library item is the title being logged.
 *
 * @param item - Cached grid or lookup library item
 * @param mediaId - Media id from the mutation input
 * @returns Whether `item.media` matches `mediaId` as an id or populated relation
 */
export function matchesLogWatchMedia(item: LibraryItem, mediaId: number | string): boolean {
  return (
    String(item.media) === String(mediaId) ||
    (typeof item.media === 'object' && item.media.id === Number(mediaId))
  )
}

/**
 * Applies batch status and TV progress onto a cached library item when media ids match.
 *
 * `lastSeason` / `lastEpisode` come from the chronologically latest logged episode.
 * `episodesWatched` increases only for pairs that are not already in `watchedEpisodeKeys`
 * and are not repeated in this payload. A completed show does not increase the count.
 *
 * @param item - Cached library item
 * @param input - Batch log-watch mutation input
 * @param watchedEpisodeKeys - Prior `season:episode` keys; omit when coverage is unknown
 * @returns The patched item, or `item` unchanged when media ids do not match
 */
export function patchLibraryItemFromBatch(
  item: LibraryItem,
  input: LogWatchBatchInput,
  watchedEpisodeKeys: ReadonlySet<string> = EMPTY_WATCHED_EPISODE_KEYS,
): LibraryItem {
  if (!matchesLogWatchMedia(item, input.mediaId)) {
    return item
  }

  const latestEpisode = [...input.episodes]
    .sort((left, right) => {
      if (left.season !== right.season) {
        return left.season - right.season
      }

      return left.episode - right.episode
    })
    .at(-1)
  const newEpisodeCount = countFirstWatchEpisodes(item, input.episodes, watchedEpisodeKeys)

  return {
    ...item,
    ...(input.libraryItemStatus ? { status: input.libraryItemStatus } : {}),
    ...(input.episodes.length > 0
      ? {
          progress: {
            ...item.progress,
            type: 'tv',
            ...(latestEpisode
              ? { lastEpisode: latestEpisode.episode, lastSeason: latestEpisode.season }
              : {}),
            ...(newEpisodeCount > 0
              ? { episodesWatched: (item.progress.episodesWatched ?? 0) + newEpisodeCount }
              : {}),
          },
        }
      : {}),
  }
}

/**
 * Applies single-log status, movie watched/rewatchCount, and TV progress onto a cached item.
 *
 * Movies set `progress.watched` and increment `rewatchCount` when the cached item is already
 * watched or completed. TV progress is patched from `tvContext`, using `watchedEpisodeKeys`
 * the same way as a one-episode batch.
 *
 * @param item - Cached library item
 * @param input - Single log-watch mutation input
 * @param watchedEpisodeKeys - Prior `season:episode` keys; omit when coverage is unknown
 * @returns The patched item, or `item` unchanged when media ids do not match
 */
export function patchLibraryItemFromLogWatch(
  item: LibraryItem,
  input: LogWatchInput,
  watchedEpisodeKeys: ReadonlySet<string> = EMPTY_WATCHED_EPISODE_KEYS,
): LibraryItem {
  if (!matchesLogWatchMedia(item, input.mediaId)) {
    return item
  }

  if (input.tvContext?.season != null && input.tvContext?.episode != null) {
    return patchLibraryItemFromBatch(
      item,
      {
        episodes: [
          {
            episode: input.tvContext.episode,
            season: input.tvContext.season,
          },
        ],
        mediaId: input.mediaId,
        ...(input.libraryItemStatus ? { libraryItemStatus: input.libraryItemStatus } : {}),
      },
      watchedEpisodeKeys,
    )
  }

  const isRewatch = isMovieRewatch(item)

  return {
    ...item,
    ...(input.libraryItemStatus ? { status: input.libraryItemStatus } : {}),
    progress: {
      ...item.progress,
      type: 'movie',
      watched: true,
    },
    ...(isRewatch ? { rewatchCount: (item.rewatchCount ?? 0) + 1 } : {}),
  }
}

/**
 * Puts watched-episodes caches back to the values from before an optimistic log.
 *
 * @param queryClient - Client holding watched-episodes queries
 * @param previous - Entries returned by `applyOptimisticWatchedEpisodes`
 */
export function restoreWatchedEpisodeQueries(
  queryClient: QueryClient,
  previous: WatchedEpisodeQuerySnapshot,
): void {
  for (const [queryKey, data] of previous) {
    queryClient.setQueryData(queryKey, data)
  }
}

// Watched pairs plus logged pairs that are not already present. Same array when nothing is new.
function appendWatchedEpisodes(
  watched: WatchedEpisodePair[],
  logged: readonly WatchedEpisodePair[],
): WatchedEpisodePair[] {
  const seen = toWatchedEpisodeKeySet(watched)
  const added: WatchedEpisodePair[] = []

  for (const pair of logged) {
    const key = toWatchedEpisodeKey(pair.season, pair.episode)

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    added.push({ episode: pair.episode, season: pair.season })
  }

  if (added.length === 0) {
    return watched
  }

  return [...watched, ...added]
}

/**
 * First-watch episodes in this payload.
 *
 * Pairs already in `watchedEpisodeKeys`, repeated in this payload, or covered because the
 * show is `completed` do not count.
 *
 * @param item - Library item whose status is the show-level coverage claim
 * @param episodes - Episodes in the mutation payload
 * @param watchedEpisodeKeys - Prior `season:episode` keys
 * @returns How many episodes should increase `episodesWatched`
 */
function countFirstWatchEpisodes(
  item: Pick<LibraryItem, 'status'>,
  episodes: ReadonlyArray<{ episode: number; season: number }>,
  watchedEpisodeKeys: ReadonlySet<string>,
): number {
  const seen = new Set(watchedEpisodeKeys)
  let count = 0

  for (const episode of episodes) {
    if (
      isTvEpisodeRewatch({
        episode: episode.episode,
        libraryItemStatus: item.status,
        season: episode.season,
        watchedEpisodeKeys: seen,
      })
    ) {
      continue
    }

    count += 1
    seen.add(toWatchedEpisodeKey(episode.season, episode.episode))
  }

  return count
}

// Library item ids in the grid and lookup caches whose media matches this log.
function libraryItemIdsForMedia(queryClient: QueryClient, mediaId: number | string): number[] {
  const ids: number[] = []
  const seen = new Set<number>()

  const consider = (item: LibraryItem) => {
    if (!matchesLogWatchMedia(item, mediaId) || seen.has(item.id)) {
      return
    }

    seen.add(item.id)
    ids.push(item.id)
  }

  for (const [, items] of queryClient.getQueriesData<LibraryItem[]>({
    queryKey: ['library-items', 'lookup'],
  })) {
    items?.forEach(consider)
  }

  for (const [, response] of queryClient.getQueriesData<LibraryItemsResponse>({
    queryKey: ['library-items', 'grid'],
  })) {
    response?.docs.forEach(consider)
  }

  return ids
}
