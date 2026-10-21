import type { MediaType } from '@plotline/shared/constants'
import type { TmdbTvSeasonEpisode } from '@plotline/shared/tmdb'

import type { DashboardActivityRow } from '../types'

/** Series, season, and episode that can be titled from TMDB. */
export type EpisodeTitleSource = {
  episode: null | number
  mediaType: MediaType | null
  season: null | number
  tmdbId: null | number
}

/** Season and episode a recently watched row can title from TMDB. */
export type WatchedEpisodeLookup = {
  episode: number
  season: number
  tmdbId: number
}

/**
 * Trimmed TMDB title for one episode number.
 *
 * @param episodes - Episodes returned for the season
 * @param episodeNumber - Episode to match
 * @returns The title, or null when that episode is missing or has a blank name
 */
export function episodeTitleForNumber(
  episodes: readonly TmdbTvSeasonEpisode[],
  episodeNumber: number,
): null | string {
  const match = episodes.find((episode) => episode.episode_number === episodeNumber)
  const name = match?.name?.trim()

  return name ? name : null
}

/**
 * Season and episode coordinates for a TV title that can be named from TMDB.
 *
 * Films and rows without a season, episode, or series id return null.
 *
 * @param source - Media type, TMDB id, and season/episode numbers
 * @returns Coordinates for a season-details lookup, or null when the source is not a titled episode
 */
export function episodeTitleLookup(source: EpisodeTitleSource): null | WatchedEpisodeLookup {
  if (source.mediaType !== 'tv' || source.tmdbId == null || source.tmdbId < 1) {
    return null
  }

  if (source.season == null || source.episode == null) {
    return null
  }

  if (!Number.isFinite(source.season) || !Number.isFinite(source.episode)) {
    return null
  }

  return { episode: source.episode, season: source.season, tmdbId: source.tmdbId }
}

/**
 * Season and episode coordinates for a TV watch that can be titled from TMDB.
 *
 * Movies, milestones, and watches without a season or episode number return null.
 *
 * @param row - Activity row from the dashboard feed
 * @returns Coordinates for a season-details lookup, or null when the row is not a titled episode
 */
export function watchedEpisodeLookup(row: DashboardActivityRow): null | WatchedEpisodeLookup {
  return episodeTitleLookup(row)
}

/**
 * Episode title for a recently watched TV row, when the season list includes one.
 *
 * @param lookup - Season and episode coordinates; null skips the lookup
 * @param episodes - TMDB episodes for that season; null while they are still loading
 * @returns The trimmed title, or null when the row is not an episode or TMDB has no name
 */
export function watchedEpisodeTitle(
  lookup: null | WatchedEpisodeLookup,
  episodes: null | readonly TmdbTvSeasonEpisode[] | undefined,
): null | string {
  if (lookup == null || episodes == null) {
    return null
  }

  return episodeTitleForNumber(episodes, lookup.episode)
}
