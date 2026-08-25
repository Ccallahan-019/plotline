import type { LibraryItem } from '@plotline/payload-types'

import { buildTvProgressUpdate } from './buildTvProgressUpdate'

export type WatchEventLibraryItemProgressUpdate = {
  progress?: { type: 'movie'; watched: true } | ReturnType<typeof buildTvProgressUpdate>
  rewatchCount?: number
}

type WatchEventProgressSource = {
  eventType?: string
  isRewatch?: boolean | null
  tvContext?: {
    episode?: null | number
    season?: null | number
  } | null
}

/**
 * Progress and rewatch fields to merge onto a library item after a watch-event create.
 *
 * Any event with season/episode `tvContext` rebuilds last season/episode, including
 * `rewatched`. First-watch TV events also increment `episodesWatched`. Movie `completed`
 * and rewatch events set `progress.watched`. Rewatches increment `rewatchCount` for movies
 * only.
 *
 * @param doc - Created watch event (event type, rewatch flag, optional TV context)
 * @param libraryItem - Current library item used for media type and the existing rewatch count
 * @returns Fields to patch onto the library item; empty when this event should not change progress
 */
export function buildWatchEventLibraryItemProgressUpdate(
  doc: WatchEventProgressSource,
  libraryItem: null | Pick<LibraryItem, 'progress' | 'rewatchCount'> | undefined,
): WatchEventLibraryItemProgressUpdate {
  const update: WatchEventLibraryItemProgressUpdate = {}
  const isRewatch = isRewatchWatchEvent(doc)

  if (hasTvEpisodeContext(doc.tvContext)) {
    update.progress = buildTvProgressUpdate(doc.tvContext, libraryItem?.progress, { isRewatch })
  } else if (isMovieWatchedEvent(doc, libraryItem, isRewatch)) {
    update.progress = {
      type: 'movie',
      watched: true,
    }
  }

  if (isRewatch && libraryItem?.progress?.type === 'movie') {
    update.rewatchCount = (libraryItem.rewatchCount ?? 0) + 1
  }

  return update
}

/**
 * True when the event has a season or episode so TV cursor/count can be rebuilt.
 *
 * Empty Payload group objects (`{ season: null, episode: null }`) are ignored so movie
 * events do not pick up a TV progress patch.
 *
 * @param tvContext - Optional watch-event TV group
 * @returns Whether `tvContext` has at least one episode coordinate
 */
export function hasTvEpisodeContext(
  tvContext: WatchEventProgressSource['tvContext'],
): tvContext is NonNullable<WatchEventProgressSource['tvContext']> {
  return tvContext != null && (tvContext.season != null || tvContext.episode != null)
}

/**
 * True when this event should count as a rewatch for library-item `rewatchCount`.
 *
 * @param doc.eventType - Watch event type; `rewatched` always counts
 * @param doc.isRewatch - Explicit rewatch flag from the log-watch form
 * @returns Whether `rewatchCount` should increment
 */
export function isRewatchWatchEvent(
  doc: Pick<WatchEventProgressSource, 'eventType' | 'isRewatch'>,
): boolean {
  return doc.isRewatch === true || doc.eventType === 'rewatched'
}

// Movie first-watch (`completed`) and rewatch events mark the title as watched.
function isMovieWatchedEvent(
  doc: WatchEventProgressSource,
  libraryItem: null | Pick<LibraryItem, 'progress'> | undefined,
  isRewatch: boolean,
): boolean {
  return (
    libraryItem?.progress?.type === 'movie' && (doc.eventType === 'completed' || isRewatch)
  )
}
