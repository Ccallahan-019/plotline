import type { LibraryItem } from '@plotline/payload-types'
import type {
  DeriveRewatchResult,
  WatchEventTvContext,
} from '@plotline/shared/log-watch'
import type { PayloadRequest } from 'payload'

import {
  collectWatchedEpisodeKeys,
  deriveRewatch,
  toWatchedEpisodeKeyFromTvContext,
} from '@plotline/shared/log-watch'

export type LogWatchRewatchContext = {
  libraryItem: LibraryItem
  watchedEpisodeKeys: Set<string>
}

const WATCHED_EPISODE_PAGE_SIZE = 100

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
 * @returns The item snapshot and a mutable watched-key set for this request
 */
export async function loadLogWatchRewatchContext(
  req: PayloadRequest,
  libraryItemId: number,
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
      ? await loadWatchedEpisodeKeys(req, libraryItemId)
      : new Set<string>()

  return { libraryItem, watchedEpisodeKeys }
}

/**
 * Pages through watch events for a library item until exhausted and collects unique
 * `season:episode` keys from events that include TV context.
 *
 * @param req - Payload request (uses the open transaction when present)
 * @param libraryItemId - Library item whose watch events to scan
 * @returns Mutable set of identity keys for {@link deriveLogWatchRewatch}
 */
async function loadWatchedEpisodeKeys(
  req: PayloadRequest,
  libraryItemId: number,
): Promise<Set<string>> {
  const keys = new Set<string>()
  let page = 1

  while (true) {
    const result = await req.payload.find({
      collection: 'watch-events',
      depth: 0,
      limit: WATCHED_EPISODE_PAGE_SIZE,
      overrideAccess: true,
      page,
      req,
      where: {
        libraryItem: { equals: libraryItemId },
      },
    })

    for (const key of collectWatchedEpisodeKeys(result.docs)) {
      keys.add(key)
    }

    if (!result.hasNextPage || result.docs.length === 0) {
      break
    }

    page += 1
  }

  return keys
}
