import { TmdbError } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { getMediaTitlePage } from '@/features/media-detail/services/get-media-title'
import { MediaTitleNotFoundError } from '@/features/media-detail/services/media-title-errors'
import { parseMediaTitleParams } from '@/features/media-detail/services/parse-media-title-params'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ mediaType: string; tmdbId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const params = await context.params
  const parsed = parseMediaTitleParams(params.mediaType, params.tmdbId)

  if (!parsed) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  }

  try {
    const data = await getMediaTitlePage(authResult.clerkUserId, parsed.mediaType, parsed.tmdbId)

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof MediaTitleNotFoundError) {
      return NextResponse.json({ error: 'Title not found' }, { status: 404 })
    }

    if (error instanceof TmdbError) {
      const status = error.status >= 500 ? 502 : error.status

      return NextResponse.json({ error: 'TMDB request failed' }, { status })
    }

    return handlePayloadError(error)
  }
}
