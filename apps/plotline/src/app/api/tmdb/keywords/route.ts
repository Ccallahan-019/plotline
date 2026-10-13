import { createTmdbClient } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { MIN_TMDB_QUERY_LENGTH } from '@/features/search/services/search-filters'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN

  if (!accessToken) {
    return NextResponse.json({ error: 'TMDB is not configured' }, { status: 503 })
  }

  const query = new URL(request.url).searchParams.get('q')?.trim() ?? ''

  if (query.length < MIN_TMDB_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `Provide a search query of at least ${MIN_TMDB_QUERY_LENGTH} characters` },
      { status: 400 },
    )
  }

  try {
    const client = createTmdbClient(accessToken)
    const results = await client.searchKeywords(query, 1)

    return NextResponse.json(results)
  } catch (error) {
    return handlePayloadError(error)
  }
}
