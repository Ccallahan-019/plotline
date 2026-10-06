import { NextResponse } from 'next/server'

import { getWatchlistMemberships } from '@/features/watchlists/services/get-watchlist-memberships'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { searchParams } = new URL(request.url)
  const libraryItemId = Number(searchParams.get('libraryItemId'))

  if (!libraryItemId || Number.isNaN(libraryItemId)) {
    return NextResponse.json({ error: 'libraryItemId is required' }, { status: 400 })
  }

  try {
    const memberships = await getWatchlistMemberships(authResult.clerkUserId, {
      libraryItemId,
    })

    return NextResponse.json(memberships)
  } catch (error) {
    return handlePayloadError(error)
  }
}
