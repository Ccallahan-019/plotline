import { NextResponse } from 'next/server'

import type { WatchlistCardFilter } from '@/features/watchlists/types'

import { getWatchlistCards } from '@/features/watchlists/cards/services/get-watchlist-cards'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const filter = parseWatchlistCardFilter(new URL(request.url).searchParams.get('filter'))

  if (!filter) {
    return NextResponse.json({ error: 'Invalid filter' }, { status: 400 })
  }

  try {
    const cards = await getWatchlistCards(authResult.clerkUserId, filter)

    return NextResponse.json(cards)
  } catch (error) {
    return handlePayloadError(error)
  }
}

function parseWatchlistCardFilter(value: null | string): null | WatchlistCardFilter {
  if (value === 'challenge' || value === 'list') {
    return value
  }

  return null
}
