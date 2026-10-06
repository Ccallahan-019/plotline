import type { LibraryItem } from '@plotline/payload-types'
import type { DeriveRewatchResult, WatchEventTvContext } from '@plotline/shared/log-watch'
import type { PayloadRequest } from 'payload'

import {
  deriveRewatch,
  toWatchedEpisodeKeyFromTvContext,
  toWatchedEpisodeKeySet,
} from '@plotline/shared/log-watch'

import {
  loadWatchedEpisodePairs,
  type LoadWatchedEpisodePairsOptions,
} from '../../collections/watch-events/utils/loadWatchedEpisodePairs'

export type LogWatchRewatchContext = {
  libraryItem: LibraryItem
  watchedEpisodeKeys: Set<string>
}

/**
 * Classifies a log-watch from the locked snapshot and records first-watch TV keys.
 *
 * Movies use `progress.watched` / `status`. TV uses watched keys plus show-level
 * `completed`. After a TV first-watch, the pair is added to `watchedEpisodeKeys` so later
 * rows in the same batch are rewatches. `libraryItemStatus` from this request is not
 * applied yet — callers must classify against persisted state.
 *
 * @param context - Locked library item and watched-key set
 * @param tvContext - Season/episode when logging TV; ignored for movies
 * @returns `isRewatch` and the event type to persist
 */
export function deriveLogWatchRewatch(
  context: LogWatchRewatchContext,
  tvContext?: null | WatchEventTvContext,
): DeriveRewatchResult {
  if (context.libraryItem.progress.type === 'movie') {
    return deriveRewatch({
      libraryItem: context.libraryItem,
      mediaType: 'movie',
    })
  }

  const key = toWatchedEpisodeKeyFromTvContext(tvContext)

  if (key === null || tvContext?.season == null || tvContext.episode == null) {
    const isRewatch = context.libraryItem.status === 'completed'

    return {
      eventType: isRewatch ? 'rewatched' : 'progress',
      isRewatch,
    }
  }

  const result = deriveRewatch({
    episode: tvContext.episode,
    libraryItemStatus: context.libraryItem.status,
    mediaType: 'tv',
    season: tvContext.season,
    watchedEpisodeKeys: context.watchedEpisodeKeys,
  })

  if (!result.isRewatch) {
    context.watchedEpisodeKeys.add(key)
  }

  return result
}

/**
 * Reloads the library item and, for TV, every watched `season:episode` key.
 *
 * Must run under `withLibraryItemRowLock` so classification sees the latest committed
 * progress, status, and watch events. Events without `tvContext` are ignored.
 *
 * @param req - Payload request (uses the open transaction when present)
 * @param libraryItemId - Locked library item to reload
 * @param options.excludeEventId - Watch event to leave out of coverage (a create hook's own row)
 * @returns The item snapshot and a mutable watched-key set for this request
 */
export async function loadLogWatchRewatchContext(
  req: PayloadRequest,
  libraryItemId: number,
  options?: LoadWatchedEpisodePairsOptions,
): Promise<LogWatchRewatchContext> {
  const libraryItem = await req.payload.findByID({
    collection: 'library-items',
    depth: 0,
    id: libraryItemId,
    overrideAccess: true,
    req,
  })

  const watchedEpisodeKeys =
    libraryItem.progress.type === 'tv'
      ? toWatchedEpisodeKeySet(await loadWatchedEpisodePairs(req, libraryItemId, options))
      : new Set<string>()

  return { libraryItem, watchedEpisodeKeys }
}
