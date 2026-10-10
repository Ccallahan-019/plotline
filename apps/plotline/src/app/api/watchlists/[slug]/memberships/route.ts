import { NextResponse } from 'next/server'

import { getWatchlistDetailMemberships } from '@/features/watchlists/services/get-watchlist-detail-memberships'
import { getWatchlistBySlug } from '@/features/watchlists/services/get-watchlists'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { slug } = await context.params

  try {
    const watchlist = await getWatchlistBySlug(authResult.clerkUserId, slug)

    if (!watchlist) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    const memberships = await getWatchlistDetailMemberships(authResult.clerkUserId, watchlist.id)

    return NextResponse.json(memberships)
  } catch (error) {
    return handlePayloadError(error)
  }
}
