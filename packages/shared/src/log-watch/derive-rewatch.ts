import type { MediaStatus, MediaType } from '../constants/media'

export type DerivedLogWatchEventType = 'completed' | 'progress' | 'rewatched'

export type DeriveMovieRewatchInput = {
  libraryItem: DeriveRewatchLibraryItem
  mediaType: Extract<MediaType, 'movie'>
}

export type DeriveRewatchInput = DeriveMovieRewatchInput | DeriveTvRewatchInput

export type DeriveRewatchLibraryItem = {
  progress?: {
    watched?: boolean | null
  } | null
  status?: MediaStatus | null
}

export type DeriveRewatchResult = {
  eventType: DerivedLogWatchEventType
  isRewatch: boolean
}

export type DeriveTvRewatchInput = {
  episode: number
  libraryItemStatus?: MediaStatus | null
  mediaType: Extract<MediaType, 'tv'>
  season: number
  watchedEpisodeKeys: ReadonlySet<string>
}

export type WatchedEpisodePair = {
  episode: number
  season: number
}

export type WatchEventTvContext = {
  episode?: null | number
  season?: null | number
}

/**
 * Unique `season:episode` keys from watch events that include a TV context.
 *
 * Events without `tvContext` (including series-level completed rows) are ignored and do not
 * count as episode coverage.
 *
 * @param events - Watch events that may or may not carry `tvContext`
 * @returns A set of `season:episode` keys suitable for {@link deriveRewatch}
 */
export function collectWatchedEpisodeKeys(
  events: ReadonlyArray<{ tvContext?: null | WatchEventTvContext }>,
): Set<string> {
  const keys = new Set<string>()

  for (const event of events) {
    const key = toWatchedEpisodeKeyFromTvContext(event.tvContext)

    if (key !== null) {
      keys.add(key)
    }
  }

  return keys
}

/**
 * Classifies a log-watch as a first watch or rewatch and returns the event type to persist.
 *
 * Movies rewatch when the title is already watched or completed. TV episodes rewatch when the
 * `season:episode` pair is already in `watchedEpisodeKeys`, already appeared earlier in this
 * batch (caller updates that set after each first-watch), or the show is completed. Identity
 * is the only signal — `watchedAt` and TV `lastSeason` / `lastEpisode` are ignored.
 *
 * @param input - Movie library-item snapshot, or a TV episode plus watched-key set
 * @returns `isRewatch` and the `completed` / `progress` / `rewatched` event type
 */
export function deriveRewatch(input: DeriveRewatchInput): DeriveRewatchResult {
  switch (input.mediaType) {
    case 'movie':
      return deriveMovieRewatch(input.libraryItem)
    case 'tv':
      return deriveTvEpisodeRewatch(input)
    default: {
      const _exhaustive: never = input

      return _exhaustive
    }
  }
}

/**
 * True when a movie log should be stored as a rewatch.
 *
 * @param libraryItem - Current status and movie `progress.watched`
 * @returns Whether the title has already been watched or marked completed
 */
export function isMovieRewatch(libraryItem: DeriveRewatchLibraryItem): boolean {
  return libraryItem.progress?.watched === true || libraryItem.status === 'completed'
}

/**
 * True when a TV episode log should be stored as a rewatch.
 *
 * Show-level `completed` is a coverage claim for every episode. `lastSeason` / `lastEpisode`
 * are not a watermark — rewatches can move that cursor backward.
 *
 * @param options.episode - Episode number being logged
 * @param options.libraryItemStatus - Library item status; `completed` covers the whole show
 * @param options.season - Season number being logged
 * @param options.watchedEpisodeKeys - `season:episode` keys from prior events and this batch
 * @returns Whether this pair has already been covered
 */
export function isTvEpisodeRewatch(options: {
  episode: number
  libraryItemStatus?: MediaStatus | null
  season: number
  watchedEpisodeKeys: ReadonlySet<string>
}): boolean {
  if (options.libraryItemStatus === 'completed') {
    return true
  }

  return options.watchedEpisodeKeys.has(toWatchedEpisodeKey(options.season, options.episode))
}

/**
 * Stable `season:episode` identity key for TV rewatch classification.
 *
 * @param season - Season number (0 is allowed for specials)
 * @param episode - Episode number
 * @returns Key used in watched-episode sets
 */
export function toWatchedEpisodeKey(season: number, episode: number): string {
  return `${season}:${episode}`
}

/**
 * Returns a watched-episode key when `tvContext` has integer season and episode coordinates.
 *
 * @param tvContext - Optional watch-event TV context; missing or incomplete context is ignored
 * @returns The identity key, or `null` when the event is not episode coverage
 */
export function toWatchedEpisodeKeyFromTvContext(
  tvContext: null | undefined | WatchEventTvContext,
): null | string {
  if (tvContext == null) {
    return null
  }

  if (!isEpisodeCoordinate(tvContext.season) || !isEpisodeCoordinate(tvContext.episode)) {
    return null
  }

  return toWatchedEpisodeKey(tvContext.season, tvContext.episode)
}

/**
 * Builds a watched-episode key set from known season/episode pairs.
 *
 * @param episodes - Pairs already known to have been watched
 * @returns A set of {@link toWatchedEpisodeKey} values
 */
export function toWatchedEpisodeKeySet(episodes: ReadonlyArray<WatchedEpisodePair>): Set<string> {
  return new Set(episodes.map((episode) => toWatchedEpisodeKey(episode.season, episode.episode)))
}

// Movie first-watch stores `completed`; a second log of the same title stores `rewatched`.
function deriveMovieRewatch(libraryItem: DeriveRewatchLibraryItem): DeriveRewatchResult {
  const isRewatch = isMovieRewatch(libraryItem)

  return {
    eventType: isRewatch ? 'rewatched' : 'completed',
    isRewatch,
  }
}

// TV first-watch stores `progress`; a covered episode stores `rewatched`.
function deriveTvEpisodeRewatch(input: DeriveTvRewatchInput): DeriveRewatchResult {
  const isRewatch = isTvEpisodeRewatch(input)

  return {
    eventType: isRewatch ? 'rewatched' : 'progress',
    isRewatch,
  }
}

// Season 0 (specials) is valid coverage; non-integers are not.
function isEpisodeCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}
