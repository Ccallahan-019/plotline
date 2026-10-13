import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { mapTmdbCommunityReviews } from '@/features/media-detail/services/map-tmdb-reviews'
import { parseMediaTitleParams } from '@/features/media-detail/services/parse-media-title-params'
import { parseReviewPage } from '@/features/media-detail/services/parse-review-page'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'
import { tmdbErrorResponse } from '@/lib/api/tmdb-error-response'

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
      return tmdbErrorResponse(error, {
        invalidPage: 'Invalid page',
        notFound: 'Reviews not found',
      })
    }

    return handlePayloadError(error)
  }
}
