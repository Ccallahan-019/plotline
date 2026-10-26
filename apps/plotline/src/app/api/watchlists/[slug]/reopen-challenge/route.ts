import { NextResponse } from 'next/server'

import { reopenWatchlistChallenge } from '@/features/watchlists/detail/services/reopen-watchlist-challenge'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { slug } = await context.params

  try {
    const watchlist = await reopenWatchlistChallenge(authResult.clerkUserId, slug)

    return NextResponse.json(watchlist)
  } catch (error) {
    return handlePayloadError(error)
  }
}
