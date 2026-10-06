import { createTmdbClient } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import type { TmdbGenresResponse } from '@/features/search/types'

import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET() {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN

  if (!accessToken) {
    return NextResponse.json({ error: 'TMDB is not configured' }, { status: 503 })
  }

  try {
    const client = createTmdbClient(accessToken)
    const [movieGenres, tvGenres] = await Promise.all([
      client.getMovieGenreList(),
      client.getTvGenreList(),
    ])

    const response: TmdbGenresResponse = {
      movie: movieGenres.genres,
      tv: tvGenres.genres,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    return handlePayloadError(error)
  }
}
