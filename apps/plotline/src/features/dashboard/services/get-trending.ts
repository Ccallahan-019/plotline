import type { TmdbClient } from '@plotline/shared/tmdb'

import type { TrendingTitles } from '../types'

import { mixTrendingTitles } from './trending'

/**
 * Loads a short mixed list of this week's trending movies and series.
 *
 * @param client - TMDB client
 * @returns Interleaved weekly trending titles
 * @throws When either TMDB trending call fails
 */
export async function getTrendingTitles(client: TmdbClient): Promise<TrendingTitles> {
  const [movies, shows] = await Promise.all([client.getTrending('movie'), client.getTrending('tv')])

  return { items: mixTrendingTitles(movies.results, shows.results) }
}
