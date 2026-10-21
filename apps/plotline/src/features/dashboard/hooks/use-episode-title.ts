import { useTvSeasonEpisodes } from '@/features/library/log-watch/hooks/use-tv-season-episodes'

import { type WatchedEpisodeLookup, watchedEpisodeTitle } from '../services/episode-title'

/**
 * TMDB title for one episode, when the season details include a name.
 *
 * Shares the log-watch season cache. The query stays off until `lookup` has a
 * series id and season number. A missing or blank TMDB name returns null.
 *
 * @param lookup - Season, episode, and TMDB series id; null skips the fetch
 * @returns The trimmed episode title, or null while loading, on error, or when TMDB has no name
 */
export function useEpisodeTitle(lookup: null | WatchedEpisodeLookup): null | string {
  const season = useTvSeasonEpisodes(lookup?.tmdbId, lookup?.season, {
    enabled: lookup != null,
  })

  return watchedEpisodeTitle(lookup, season.data?.episodes)
}
