import {
  createTmdbClient,
  mapMovieDetailsToUpsertInput,
  mapTvDetailsToUpsertInput,
  type TmdbUpsertMediaInput,
} from '@plotline/shared/tmdb'

import type { AddToListInput } from '../../types/mutations'

import { hasAddToListTmdbRef } from '../../types/mutations'

export async function enrichAddToListInput(input: AddToListInput): Promise<AddToListInput> {
  if (!hasAddToListTmdbRef(input)) {
    return input
  }

  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error('TMDB is not configured')
  }

  const client = createTmdbClient(accessToken)
  const fromDetails =
    input.mediaType === 'movie'
      ? mapMovieDetailsToUpsertInput(await client.getMovieDetails(input.tmdbId))
      : mapTvDetailsToUpsertInput(await client.getTvDetails(input.tmdbId))

  return mergeAddToListInputWithDetails(input, fromDetails)
}

function mergeAddToListInputWithDetails(
  input: AddToListInput,
  fromDetails: TmdbUpsertMediaInput,
): AddToListInput {
  const { status: releaseStatus, ...mediaFields } = fromDetails

  return {
    note: input.note,
    status: input.status,
    watchlistId: input.watchlistId,
    watchlistSlug: input.watchlistSlug,
    ...mediaFields,
    releaseStatus,
  }
}
