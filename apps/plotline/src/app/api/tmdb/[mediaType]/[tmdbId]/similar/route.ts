import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { parseMediaTitleParams } from '@/features/media-detail/services/parse-media-title-params'
import {
  asSinglePage,
  selectSimilarPage,
  withSimilarMediaType,
} from '@/features/media-detail/services/select-similar-page'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'
import { tmdbErrorResponse } from '@/lib/api/tmdb-error-response'

type RouteContext = {
  params: Promise<{ mediaType: string; tmdbId: string }>
}

// Always serves the first page of results; a `page` query is not read.
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
    const recommendations = await client.getRecommendations(parsed.mediaType, parsed.tmdbId)
    const page = await selectSimilarPage(recommendations, () =>
      client.getSimilar(parsed.mediaType, parsed.tmdbId),
    )

    return NextResponse.json(withSimilarMediaType(asSinglePage(page), parsed.mediaType))
  } catch (error) {
    if (error instanceof TmdbError) {
      return tmdbErrorResponse(error, { notFound: 'Title not found' })
    }

    return handlePayloadError(error)
  }
}
