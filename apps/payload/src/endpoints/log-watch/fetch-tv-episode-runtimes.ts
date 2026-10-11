import { createTmdbClient } from '@plotline/shared/tmdb'

import { loadTvEpisodeRuntimes } from '../../collections/watch-events/utils/watch-event-runtime'

type LoggedEpisode = {
  episode: number
  season: number
}

/**
 * Loads per-episode runtimes for a series before the log-watch transaction.
 *
 * A missing token or TMDB id returns an empty map. Season failures are handled
 * inside `loadTvEpisodeRuntimes`. Do not call this under the library-item row lock.
 *
 * @param tmdbId - TMDB series id from the catalog row
 * @param episodes - Episodes about to be logged
 * @returns `season:episode` keys to positive runtimes
 */
export async function fetchTvEpisodeRuntimes(
  tmdbId: null | number | undefined,
  episodes: readonly LoggedEpisode[],
): Promise<Map<string, number>> {
  if (tmdbId == null || tmdbId <= 0 || episodes.length === 0) {
    return new Map()
  }

  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN?.trim()

  if (!accessToken) {
    return new Map()
  }

  const client = createTmdbClient(accessToken)

  return loadTvEpisodeRuntimes(episodes, (seasonNumber) =>
    client.getTvSeasonDetails(tmdbId, seasonNumber),
  )
}
