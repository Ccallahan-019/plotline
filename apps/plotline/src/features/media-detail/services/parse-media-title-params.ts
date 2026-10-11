import type { MediaType } from '@plotline/shared/constants'

import { toNonNegativeInteger } from '@plotline/shared/utils'

export type ParsedMediaTitleParams = {
  mediaType: MediaType
  tmdbId: number
}

/**
 * Reads the title route params.
 *
 * @param mediaType - `movie` or `tv` path segment
 * @param tmdbId - TMDB id path segment
 * @returns The parsed pair, or `null` when either segment is not a title id
 */
export function parseMediaTitleParams(
  mediaType: string,
  tmdbId: string,
): null | ParsedMediaTitleParams {
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return null
  }

  const parsedTmdbId = toNonNegativeInteger(tmdbId)

  if (parsedTmdbId == null || parsedTmdbId < 1) {
    return null
  }

  return { mediaType, tmdbId: parsedTmdbId }
}
