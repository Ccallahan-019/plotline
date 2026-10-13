import { toNonNegativeInteger } from '@plotline/shared/utils'
import { NextResponse } from 'next/server'

import { getWatchedEpisodes } from '@/features/library/watch-events/services/get-watched-episodes'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { searchParams } = new URL(request.url)
  const libraryItemId = toNonNegativeInteger(searchParams.get('libraryItemId'))

  if (libraryItemId == null || libraryItemId < 1) {
    return NextResponse.json({ error: 'libraryItemId is required' }, { status: 400 })
  }

  try {
    const episodes = await getWatchedEpisodes(authResult.clerkUserId, libraryItemId)

    return NextResponse.json(episodes)
  } catch (error) {
    return handlePayloadError(error)
  }
}
