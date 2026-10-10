import { NextResponse } from 'next/server'

import { removeWatchlistMembership } from '@/features/watchlists/services/remove-watchlist-membership'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ membershipId: string; slug: string }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { membershipId, slug } = await context.params

  try {
    const result = await removeWatchlistMembership(authResult.clerkUserId, slug, membershipId)

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}
