import type { MediaType } from '@plotline/shared/constants'
import type { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import { formatReleaseYear } from '@/features/media-grid/grid/services/media-display-helpers'

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
 * @returns A short mixed list for the overview sidebar. Each title includes its synopsis, backdrop, release year, and score when TMDB sent them
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

  for (
    let index = 0;
    mixed.length < limit && (index < movieTitles.length || index < showTitles.length);
    index += 1
  ) {
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

// Blank path becomes null so the card can skip the backdrop.
function toBackdropPath(path: null | string | undefined): null | string {
  const trimmed = path?.trim()

  return trimmed ? trimmed : null
}

// Blank synopsis becomes null so the row can omit the description.
function toOverview(overview: null | string | undefined): null | string {
  const text = overview?.trim()

  return text ? text : null
}

// Movie year comes from `release_date`; a series year comes from `first_air_date`.
function toReleaseYear(item: TmdbSearchResultItem, mediaType: MediaType): null | string {
  const releaseDate = mediaType === 'movie' ? item.release_date : item.first_air_date

  return formatReleaseYear(releaseDate)
}

// Title, synopsis, backdrop, release year, and score. The route's media type is stamped on.
function toTrendingTitle(item: TmdbSearchResultItem, mediaType: MediaType): null | TrendingTitle {
  const title = (item.title ?? item.name ?? '').trim()

  if (!title || !Number.isFinite(item.id) || item.id <= 0) {
    return null
  }

  return {
    backdropPath: toBackdropPath(item.backdrop_path),
    mediaType,
    overview: toOverview(item.overview),
    posterPath: item.poster_path ?? null,
    releaseYear: toReleaseYear(item, mediaType),
    title,
    tmdbId: item.id,
    voteAverage: toVoteAverage(item.vote_average),
  }
}

// Community score for the badge. Missing or non-finite scores stay null.
function toVoteAverage(voteAverage: number | undefined): null | number {
  if (voteAverage == null || !Number.isFinite(voteAverage)) {
    return null
  }

  return voteAverage
}
