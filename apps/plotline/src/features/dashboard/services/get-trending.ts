import type { TmdbClient } from '@plotline/shared/tmdb'

import type { TrendingTitle, TrendingTitles } from '../types'

import { applyTrendingLength, hasTrendingLength, mixTrendingTitles } from './trending'

/**
 * Loads a short mixed list of this week's trending movies and series.
 *
 * Weekly charts omit runtime and episode count, so each mixed title loads those
 * from its details. A details failure leaves the length empty and keeps the title.
 *
 * @param client - TMDB client
 * @returns Interleaved weekly trending titles
 * @throws When either TMDB trending call fails
 */
export async function getTrendingTitles(client: TmdbClient): Promise<TrendingTitles> {
  const [movies, shows] = await Promise.all([client.getTrending('movie'), client.getTrending('tv')])
  const items = await Promise.all(
    mixTrendingTitles(movies.results, shows.results).map((item) =>
      attachTrendingLength(client, item),
    ),
  )

  return { items }
}

/**
 * Fills a movie runtime or a series episode count from TMDB details.
 *
 * Skips the lookup when the chart already included a usable length. A failed
 * lookup keeps the title so one missing detail does not drop the row.
 *
 * @param client - TMDB client
 * @param item - Mixed trending title
 * @returns The title with its length, or the same title when details fail or the length is already set
 */
async function attachTrendingLength(
  client: TmdbClient,
  item: TrendingTitle,
): Promise<TrendingTitle> {
  if (hasTrendingLength(item)) {
    return item
  }

  try {
    if (item.mediaType === 'movie') {
      const details = await client.getMovieDetails(item.tmdbId)

      return applyTrendingLength(item, details.runtime)
    }

    const details = await client.getTvDetails(item.tmdbId)

    return applyTrendingLength(item, details.number_of_episodes)
  } catch (error) {
    console.error(error)

    return item
  }
}
