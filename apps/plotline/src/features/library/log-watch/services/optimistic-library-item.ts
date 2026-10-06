import type { LibraryItem } from '@plotline/payload-types'
import type { QueryClient } from '@tanstack/react-query'

import {
  isMovieRewatch,
  isTvEpisodeRewatch,
  toWatchedEpisodeKey,
  toWatchedEpisodeKeySet,
  type WatchedEpisodePair,
} from '@plotline/shared/log-watch'

import type { LogWatchBatchInput, LogWatchInput } from '../../types/mutations'

import { watchedEpisodeQueryKeys } from '../../watch-events/services/query-keys'

const EMPTY_WATCHED_EPISODE_KEYS: ReadonlySet<string> = new Set()

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
