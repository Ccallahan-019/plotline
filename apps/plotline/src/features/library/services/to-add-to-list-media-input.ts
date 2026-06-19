import type { MediaDisplay } from '@/features/media/types'
import type { AddToListTmdbMediaInput } from '@/lib/payload/types/library-mutations'

export function toAddToListTmdbMediaInput(
  media: MediaDisplay,
): AddToListTmdbMediaInput {
  if (media.tmdbId === undefined) {
    throw new Error('MediaDisplay must include tmdbId for add-to-list from search')
  }

  return {
    mediaType: media.mediaType,
    overview: media.overview,
    posterPath: media.posterPath,
    releaseDate: media.releaseDate,
    runtime: media.runtime,
    title: media.title,
    tmdbId: media.tmdbId,
    voteAverage: media.voteAverage,
    ...(media.mediaType === 'tv' && media.episodeCount != null
      ? { tvMeta: { episodeCount: media.episodeCount } }
      : {}),
  }
}
