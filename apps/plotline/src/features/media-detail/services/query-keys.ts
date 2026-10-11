import type { MediaType } from '@plotline/shared/constants'

export const mediaTitleQueryKeys = {
  detail: (mediaType: MediaType, tmdbId: number) => ['media-title', mediaType, tmdbId] as const,
  tmdbReviews: (mediaType: MediaType, tmdbId: number) =>
    ['tmdb-reviews', mediaType, tmdbId] as const,
}
