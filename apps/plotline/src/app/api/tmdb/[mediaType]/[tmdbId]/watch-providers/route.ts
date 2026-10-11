import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { mapTitleWatchOffers } from '@/features/media-detail/services/map-title-watch-offers'
import { parseMediaTitleParams } from '@/features/media-detail/services/parse-media-title-params'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'
import { tmdbErrorResponse } from '@/lib/api/tmdb-error-response'

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
    const providers =
      parsed.mediaType === 'movie'
        ? await client.getMovieTitleWatchProviders(parsed.tmdbId)
        : await client.getTvTitleWatchProviders(parsed.tmdbId)

    // The country map does not depend on the viewer, so it can be shared at the edge.
    return NextResponse.json(mapTitleWatchOffers(providers), {
      headers: {
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    if (error instanceof TmdbError) {
      return tmdbErrorResponse(error, { notFound: 'Title not found' })
    }

    // Anything else (network failure, a payload that fails schema validation) is an upstream
    // problem rather than a server bug, so it is reported like other TMDB failures.
    console.error(error)

    return NextResponse.json({ error: 'TMDB request failed' }, { status: 502 })
  }
}
