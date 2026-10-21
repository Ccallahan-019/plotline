import type { MediaType } from '@plotline/shared/constants'
import type { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import {
  formatEpisodeCount,
  formatReleaseYear,
  formatRuntime,
} from '@/features/media-grid/grid/services/media-display-helpers'

import type { TrendingTitle } from '../types'

/** How many mixed weekly trending titles the overview asks for. */
export const TRENDING_TITLE_LIMIT = 8

/**
 * Copies a fetched runtime or episode count onto a trending title.
 *
 * Movies take `runtime`. Series take `episodeCount`. Zero, negative, and
 * non-finite lengths stay null.
 *
 * @param item - Title to update
 * @param length - Minutes or episode count from TMDB details
 * @returns A new title with the length for its media type
 */
export function applyTrendingLength(
  item: TrendingTitle,
  length: null | number | undefined,
): TrendingTitle {
  const value = toTrendingLength(length)

  if (item.mediaType === 'movie') {
    return { ...item, runtime: value }
  }

  return { ...item, episodeCount: value }
}

// True when the row already has the runtime or episode count it shows.
export function hasTrendingLength(item: TrendingTitle): boolean {
  return item.mediaType === 'movie' ? item.runtime != null : item.episodeCount != null
}

/**
 * Interleaves weekly movie and series trending lists.
 *
 * Results without a title are dropped before interleaving, so a missing name
 * does not leave an empty slot. Movies and series then alternate until `limit`.
 *
 * @param movies - Page of `/trending/movie/week`
 * @param shows - Page of `/trending/tv/week`
 * @param limit - Maximum mixed titles. Defaults to eight
 * @returns A short mixed list for the overview sidebar. Each title includes its backdrop, release year, score, and runtime or episode count when TMDB sent them
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

/**
 * Media type and length for a trending row.
 *
 * Films pair with runtime (`Film · 2h 4m`). Series pair with episode count
 * (`Series · 12 episodes`). A missing length leaves the type by itself.
 *
 * @param item - Type plus the length field for that type
 * @returns A middle-dot separated description
 */
export function trendingTitleDescription(item: {
  episodeCount: null | number
  mediaType: MediaType
  runtime: null | number
}): string {
  const length =
    item.mediaType === 'movie' ? formatRuntime(item.runtime) : formatEpisodeCount(item.episodeCount)
  const typeLabel = item.mediaType === 'movie' ? 'Film' : 'Series'

  return [typeLabel, length].filter(Boolean).join(' · ')
}

// Blank path becomes null so the card can skip the backdrop.
function toBackdropPath(path: null | string | undefined): null | string {
  const trimmed = path?.trim()

  return trimmed ? trimmed : null
}

// Movie year comes from `release_date`; a series year comes from `first_air_date`.
function toReleaseYear(item: TmdbSearchResultItem, mediaType: MediaType): null | string {
  const releaseDate = mediaType === 'movie' ? item.release_date : item.first_air_date

  return formatReleaseYear(releaseDate)
}

// Positive runtime or episode count. Zero, negative, and non-finite values stay null.
function toTrendingLength(value: null | number | undefined): null | number {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return null
  }

  return value
}

// Title, backdrop, release year, score, and length. The route's media type is stamped on.
function toTrendingTitle(item: TmdbSearchResultItem, mediaType: MediaType): null | TrendingTitle {
  const title = (item.title ?? item.name ?? '').trim()

  if (!title || !Number.isFinite(item.id) || item.id <= 0) {
    return null
  }

  return {
    backdropPath: toBackdropPath(item.backdrop_path),
    episodeCount: mediaType === 'tv' ? toTrendingLength(item.number_of_episodes) : null,
    mediaType,
    posterPath: item.poster_path ?? null,
    releaseYear: toReleaseYear(item, mediaType),
    runtime: mediaType === 'movie' ? toTrendingLength(item.runtime) : null,
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
