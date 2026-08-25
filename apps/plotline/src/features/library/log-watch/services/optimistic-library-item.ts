import type { LibraryItem } from '@plotline/payload-types'

import type { LogWatchBatchInput, LogWatchInput } from '../../types/mutations'

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
 * `lastSeason` / `lastEpisode` come from the chronologically latest logged episode (including
 * rewatches). `episodesWatched` increases by the count of non-rewatch episodes.
 *
 * @param item - Cached library item
 * @param input - Batch log-watch mutation input
 * @returns The patched item, or `item` unchanged when media ids do not match
 */
export function patchLibraryItemFromBatch(
  item: LibraryItem,
  input: LogWatchBatchInput,
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
  const newEpisodeCount = input.episodes.filter((episode) => episode.isRewatch !== true).length

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
 * Movies set `progress.watched` and increment `rewatchCount` when the log is a rewatch. TV
 * progress (`lastSeason`, `lastEpisode`, `episodesWatched`) is patched from `tvContext`.
 * TV rewatches update the last-watched episode without incrementing `episodesWatched`.
 *
 * @param item - Cached library item
 * @param input - Single log-watch mutation input
 * @returns The patched item, or `item` unchanged when media ids do not match
 */
export function patchLibraryItemFromLogWatch(item: LibraryItem, input: LogWatchInput): LibraryItem {
  if (!matchesLogWatchMedia(item, input.mediaId)) {
    return item
  }

  if (input.tvContext?.season != null && input.tvContext?.episode != null) {
    return patchLibraryItemFromBatch(item, {
      episodes: [
        {
          episode: input.tvContext.episode,
          isRewatch: input.isRewatch,
          season: input.tvContext.season,
        },
      ],
      mediaId: input.mediaId,
      ...(input.libraryItemStatus ? { libraryItemStatus: input.libraryItemStatus } : {}),
    })
  }

  const isRewatch = input.isRewatch === true || input.eventType === 'rewatched'

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
