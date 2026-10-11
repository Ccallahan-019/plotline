import type { TmdbTvSeasonDetails } from '@plotline/shared/tmdb'

import { toWatchedEpisodeKey } from '@plotline/shared/log-watch'

export type TvSeasonLoader = (seasonNumber: number) => Promise<TmdbTvSeasonDetails>

/**
 * Episode lengths for the pairs being logged.
 *
 * Each distinct season is loaded once. A season that fails to load is skipped so
 * the watch can still be saved; those episodes are absent from the map and the
 * failure is passed to `onSeasonError`.
 *
 * @param episodes - Season and episode numbers from the log-watch request
 * @param fetchSeason - Loads one TMDB season. Callers supply the client or a fake
 * @param onSeasonError - Called with the season number and error when a load fails
 * @returns `season:episode` keys to positive runtimes
 */
export async function loadTvEpisodeRuntimes(
  episodes: readonly { episode: number; season: number }[],
  fetchSeason: TvSeasonLoader,
  onSeasonError?: (season: number, error: unknown) => void,
): Promise<Map<string, number>> {
  const seasons = [...new Set(episodes.map((episode) => episode.season))]
  const loaded = await Promise.all(
    seasons.map(async (season) => {
      try {
        return { details: await fetchSeason(season), season }
      } catch (error) {
        onSeasonError?.(season, error)

        return null
      }
    }),
  )

  const runtimes = new Map<string, number>()

  for (const entry of loaded) {
    if (!entry) {
      continue
    }

    for (const episode of entry.details.episodes) {
      const minutes = positiveRuntimeMinutes(episode.runtime)

      if (minutes == null) {
        continue
      }

      runtimes.set(toWatchedEpisodeKey(entry.season, episode.episode_number), minutes)
    }
  }

  return runtimes
}

/**
 * Keeps a positive runtime and drops missing or non-positive lengths.
 *
 * @param runtime - Minutes from the catalog row or a TMDB episode
 * @returns The minutes to store, or `undefined` when there is nothing to record
 */
export function positiveRuntimeMinutes(runtime: null | number | undefined): number | undefined {
  if (runtime == null || !Number.isFinite(runtime) || runtime <= 0) {
    return undefined
  }

  return runtime
}

/**
 * Runtime for one logged episode, when the season load included it.
 *
 * @param runtimes - Map from {@link loadTvEpisodeRuntimes}
 * @param episode - Season and episode being written
 * @returns Minutes, or `undefined` when that episode was not in the map
 */
export function runtimeForEpisode(
  runtimes: ReadonlyMap<string, number>,
  episode: { episode: number; season: number },
): number | undefined {
  return runtimes.get(toWatchedEpisodeKey(episode.season, episode.episode))
}
