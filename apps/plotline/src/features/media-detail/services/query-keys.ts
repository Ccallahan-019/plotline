import type { MediaType } from '@plotline/shared/constants'

export const mediaTitleQueryKeys = {
  detail: (mediaType: MediaType, tmdbId: number) => ['media-title', mediaType, tmdbId] as const,
  tmdbReviews: (mediaType: MediaType, tmdbId: number) =>
    ['tmdb-reviews', mediaType, tmdbId] as const,
  tmdbSimilar: (mediaType: MediaType, tmdbId: number) =>
    ['tmdb-similar', mediaType, tmdbId] as const,
  tmdbWatchOffers: (mediaType: MediaType, tmdbId: number) =>
    ['tmdb-watch-offers', mediaType, tmdbId] as const,
}
