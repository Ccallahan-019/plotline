import { NextResponse } from 'next/server'

import { reorderWatchlistMemberships } from '@/features/watchlists/services/reorder-watchlist-memberships'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { slug } = await context.params

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!isReorderBody(body)) {
    return NextResponse.json(
      { error: 'membershipIds must be an array of positive integers' },
      { status: 400 },
    )
  }

  try {
    const result = await reorderWatchlistMemberships(
      authResult.clerkUserId,
      slug,
      body.membershipIds,
    )

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}

// Positive integers only. Payload checks uniqueness and that the list is complete.
function isReorderBody(body: unknown): body is { membershipIds: number[] } {
  if (typeof body !== 'object' || body === null || !('membershipIds' in body)) {
    return false
  }

  const { membershipIds } = body

  return (
    Array.isArray(membershipIds) &&
    membershipIds.every((id) => typeof id === 'number' && Number.isInteger(id) && id > 0)
  )
}
