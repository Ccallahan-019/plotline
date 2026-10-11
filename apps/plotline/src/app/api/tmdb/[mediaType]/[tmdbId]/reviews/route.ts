import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { toNonNegativeInteger } from '@plotline/shared/utils'
import { NextResponse } from 'next/server'

import { mapTmdbCommunityReviews } from '@/features/media-detail/services/map-tmdb-reviews'
import { parseMediaTitleParams } from '@/features/media-detail/services/parse-media-title-params'
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
  const page = parseReviewPage(request)

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
    if (error instanceof TmdbError && error.status >= 400 && error.status < 500) {
      return NextResponse.json(
        { error: error.status === 404 ? 'Reviews not found' : 'TMDB request failed' },
        { status: error.status },
      )
    }

    return handlePayloadError(error)
  }
}

/**
 * Reads the 1-based reviews page from the query string.
 *
 * @param request - Incoming reviews request
 * @returns The page, `1` when omitted, or `null` when the value is not a positive integer
 */
function parseReviewPage(request: Request): null | number {
  const pageParam = new URL(request.url).searchParams.get('page')

  if (pageParam == null || pageParam.trim() === '') {
    return 1
  }

  const page = toNonNegativeInteger(pageParam)

  if (page == null || page < 1) {
    return null
  }

  return page
}
