import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { mapTmdbCommunityReviews } from '@/features/media-detail/services/map-tmdb-reviews'
import { parseMediaTitleParams } from '@/features/media-detail/services/parse-media-title-params'
import { parseReviewPage } from '@/features/media-detail/services/parse-review-page'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ mediaType: string; tmdbId: string }>
}

export async function GET(request: Request, context: RouteContext) {
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
  const page = parseReviewPage(request.url)

  if (!parsed) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  }

  if (page == null) {
    return NextResponse.json({ error: 'Invalid page' }, { status: 400 })
  }

  try {
    const client = createTmdbClient(accessToken)
    const reviews =
      parsed.mediaType === 'movie'
        ? await client.getMovieReviews(parsed.tmdbId, page)
        : await client.getTvReviews(parsed.tmdbId, page)

    return NextResponse.json(mapTmdbCommunityReviews(reviews))
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
 * Only a missing title and an out-of-range page are the caller's doing. Every other
 * upstream failure (bad token, quota, TMDB outage) is reported as 502, so it cannot be
 * mistaken for the user's own session status.
 *
 * @param error - Error thrown by the TMDB client
 * @returns 404 for a missing title, 400 for an invalid page, otherwise 502
 */
function tmdbErrorResponse(error: TmdbError): NextResponse {
  if (error.status === 404) {
    return NextResponse.json({ error: 'Reviews not found' }, { status: 404 })
  }

  if (error.status === 422) {
    return NextResponse.json({ error: 'Invalid page' }, { status: 400 })
  }

  return NextResponse.json({ error: 'TMDB request failed' }, { status: 502 })
}
