import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { toNonNegativeInteger } from '@plotline/shared/utils/toNonNegativeInteger'
import { NextResponse } from 'next/server'

import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ seasonNumber: string; tmdbId: string }>
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
  const tmdbId = toNonNegativeInteger(params.tmdbId)
  const seasonNumber = toNonNegativeInteger(params.seasonNumber)

  if (tmdbId == null || tmdbId < 1) {
    return NextResponse.json({ error: 'Invalid tmdbId' }, { status: 400 })
  }

  if (seasonNumber == null) {
    return NextResponse.json({ error: 'Invalid seasonNumber' }, { status: 400 })
  }

  try {
    const client = createTmdbClient(accessToken)
    const season = await client.getTvSeasonDetails(tmdbId, seasonNumber)

    return NextResponse.json(season)
  } catch (error) {
    if (error instanceof TmdbError && error.status >= 400 && error.status < 500) {
      return NextResponse.json(
        { error: error.status === 404 ? 'Season not found' : 'TMDB request failed' },
        { status: error.status },
      )
    }

    return handlePayloadError(error)
  }
}
