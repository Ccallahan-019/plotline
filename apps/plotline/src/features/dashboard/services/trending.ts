import type { MediaType } from '@plotline/shared/constants'
import type { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import type { TrendingTitle } from '../types'

/** How many mixed weekly trending titles the overview asks for. */
export const TRENDING_TITLE_LIMIT = 8

/**
 * Interleaves weekly movie and series trending lists.
 *
 * Results without a title are dropped before interleaving, so a missing name
 * does not leave an empty slot. Movies and series then alternate until `limit`.
 *
 * @param movies - Page of `/trending/movie/week`
 * @param shows - Page of `/trending/tv/week`
 * @param limit - Maximum mixed titles. Defaults to eight
 * @returns A short mixed list for the overview sidebar
 */
export function mixTrendingTitles(
  movies: readonly TmdbSearchResultItem[],
  shows: readonly TmdbSearchResultItem[],
  limit = TRENDING_TITLE_LIMIT,
): TrendingTitle[] {
  const movieTitles = movies.flatMap((item) => {
    const title = toTrendingTitle(item, 'movie')

    return title ? [title] : []
  })
  const showTitles = shows.flatMap((item) => {
    const title = toTrendingTitle(item, 'tv')

    return title ? [title] : []
  })
  const mixed: TrendingTitle[] = []

  for (let index = 0; mixed.length < limit && (index < movieTitles.length || index < showTitles.length); index += 1) {
    const movie = movieTitles[index]
    const show = showTitles[index]

    if (movie && mixed.length < limit) {
      mixed.push(movie)
    }

    if (show && mixed.length < limit) {
      mixed.push(show)
    }
  }

  return mixed
}

// Title from the movie or series field. The route's media type is stamped on.
function toTrendingTitle(
  item: TmdbSearchResultItem,
  mediaType: MediaType,
): null | TrendingTitle {
  const title = (item.title ?? item.name ?? '').trim()

  if (!title || !Number.isFinite(item.id) || item.id <= 0) {
    return null
  }

  return {
    mediaType,
    posterPath: item.poster_path ?? null,
    title,
    tmdbId: item.id,
  }
}
