import { NextResponse } from 'next/server'

import { removeWatchlistMembership } from '@/features/watchlists/services/remove-watchlist-membership'
import { updateWatchlistMembership } from '@/features/watchlists/services/update-watchlist-membership'
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

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { membershipId, slug } = await context.params

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const excludeFromGoal = readExcludeFromGoal(body)

  if (excludeFromGoal instanceof NextResponse) {
    return excludeFromGoal
  }

  try {
    const result = await updateWatchlistMembership(
      authResult.clerkUserId,
      slug,
      membershipId,
      excludeFromGoal,
    )

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}

// `excludeFromGoal` only. Other fields stay on the Payload write that derives them.
function readExcludeFromGoal(body: unknown): boolean | NextResponse {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 })
  }

  const record = body as Record<string, unknown>

  if (Object.keys(record).some((key) => key !== 'excludeFromGoal')) {
    return NextResponse.json({ error: 'Only excludeFromGoal can be updated' }, { status: 400 })
  }

  if (typeof record.excludeFromGoal !== 'boolean') {
    return NextResponse.json({ error: 'excludeFromGoal must be a boolean' }, { status: 400 })
  }

  return record.excludeFromGoal
}
