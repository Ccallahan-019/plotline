import { NextResponse } from 'next/server'

import { getWatchlistCards } from '@/features/watchlists/services/get-watchlist-cards'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET() {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const cards = await getWatchlistCards(authResult.clerkUserId)

    return NextResponse.json(cards)
  } catch (error) {
    return handlePayloadError(error)
  }
}
