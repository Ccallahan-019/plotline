import { createTmdbClient } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { browseTmdb, BrowseValidationError } from '@/features/search/services/browse'
import { getProfileWatchRegion } from '@/features/search/services/get-profile-watch-region'
import {
  isBrowseRequestEnabled,
  parseBrowseMode,
  parseMediaType,
  parseSearchFilters,
  parseSearchSort,
} from '@/features/search/services/search-filters'
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

  const { searchParams } = new URL(request.url)
  const mode = parseBrowseMode(searchParams.get('mode'))
  const query = searchParams.get('q')?.trim() ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const mediaType = parseMediaType(searchParams.get('mediaType'))
  const filters = parseSearchFilters(searchParams)
  const sort = parseSearchSort(searchParams.get('sort'))

  if (!isBrowseRequestEnabled(mode, query)) {
    return NextResponse.json(
      {
        error:
          mode === 'search'
            ? 'Provide a search query of at least 2 characters'
            : 'Invalid browse request',
      },
      { status: 400 },
    )
  }

  try {
    const client = createTmdbClient(accessToken)
    const watchRegion = await getProfileWatchRegion(authResult.clerkUserId)
    const results = await browseTmdb(
      client,
      mode,
      query,
      mediaType,
      filters,
      sort,
      Number.isNaN(page) ? 1 : page,
      watchRegion,
    )

    return NextResponse.json(results)
  } catch (error) {
    if (error instanceof BrowseValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return handlePayloadError(error)
  }
}
