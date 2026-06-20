import { createTmdbClient } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import type {
  SearchMediaType,
  TmdbWatchProvidersResponse,
  WatchProvider,
} from '@/features/search/types'

import { getProfileWatchRegion } from '@/features/search/services/get-profile-watch-region'
import { parseMediaType } from '@/features/search/services/search-filters'
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
  const mediaType = parseMediaType(searchParams.get('mediaType'))

  try {
    const client = createTmdbClient(accessToken)
    const region = await getProfileWatchRegion(authResult.clerkUserId)
    const providers = await fetchWatchProviders(client, mediaType, region)

    const response: TmdbWatchProvidersResponse = {
      providers,
      region,
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

async function fetchWatchProviders(
  client: ReturnType<typeof createTmdbClient>,
  mediaType: SearchMediaType,
  region: string,
): Promise<WatchProvider[]> {
  if (mediaType === 'tv') {
    const response = await client.getTvWatchProviders(region)
    return mapWatchProviders(response.results)
  }

  const response = await client.getMovieWatchProviders(region)
  return mapWatchProviders(response.results)
}

function mapWatchProviders(
  providers: {
    logo_path?: null | string
    provider_id: number
    provider_name: string
  }[],
): WatchProvider[] {
  return providers
    .map((provider) => ({
      id: provider.provider_id,
      logoPath: provider.logo_path ?? null,
      name: provider.provider_name,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}
