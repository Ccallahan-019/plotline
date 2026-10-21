import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { getTrendingTitles } from '@/features/dashboard/services/get-trending'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'
import { tmdbErrorResponse } from '@/lib/api/tmdb-error-response'

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
    const trending = await getTrendingTitles(createTmdbClient(accessToken))

    // The weekly chart is the same for everyone and moves slowly, so let the browser reuse it.
    return NextResponse.json(trending, { headers: { 'Cache-Control': 'private, max-age=3600' } })
  } catch (error) {
    if (error instanceof TmdbError) {
      return tmdbErrorResponse(error, { notFound: 'Trending titles are unavailable' })
    }

    return handlePayloadError(error)
  }
}
