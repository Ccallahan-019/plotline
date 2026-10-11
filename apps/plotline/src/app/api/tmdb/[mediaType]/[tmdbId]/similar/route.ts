import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { parseMediaTitleParams } from '@/features/media-detail/services/parse-media-title-params'
import {
  selectSimilarPage,
  withSimilarMediaType,
} from '@/features/media-detail/services/select-similar-page'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ mediaType: string; tmdbId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN

  if (!accessToken) {
    return NextResponse.json({ error: 'TMDB is not configured' }, { status: 503 })
  }

  const params = await context.params
  const parsed = parseMediaTitleParams(params.mediaType, params.tmdbId)

  if (!parsed) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  }

  try {
    const client = createTmdbClient(accessToken)
    const recommendations =
      parsed.mediaType === 'movie'
        ? await client.getMovieRecommendations(parsed.tmdbId)
        : await client.getTvRecommendations(parsed.tmdbId)
    const page = await selectSimilarPage(recommendations, () =>
      parsed.mediaType === 'movie'
        ? client.getMovieSimilar(parsed.tmdbId)
        : client.getTvSimilar(parsed.tmdbId),
    )

    return NextResponse.json(withSimilarMediaType(page, parsed.mediaType))
  } catch (error) {
    if (error instanceof TmdbError) {
      return tmdbErrorResponse(error)
    }

    return handlePayloadError(error)
  }
}

/**
 * Maps a failed TMDB call to this route's response.
 *
 * A missing title is the caller's doing. Every other upstream failure is reported as 502,
 * so it cannot be mistaken for the user's own session status. An empty recommendations
 * list is not an error; that case falls back to similar titles.
 *
 * @param error - Error thrown by the TMDB client
 * @returns 404 for a missing title, otherwise 502
 */
function tmdbErrorResponse(error: TmdbError): NextResponse {
  if (error.status === 404) {
    return NextResponse.json({ error: 'Title not found' }, { status: 404 })
  }

  return NextResponse.json({ error: 'TMDB request failed' }, { status: 502 })
}
