import { isVisibility } from '@plotline/shared/constants'
import { NextResponse } from 'next/server'

import type { UpdateWatchlistInput } from '@/features/watchlists/types'

import { getWatchlistBySlug } from '@/features/watchlists/services/get-watchlists'
import { updateWatchlist } from '@/features/watchlists/services/update-watchlist'
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

    return NextResponse.json(watchlist)
  } catch (error) {
    return handlePayloadError(error)
  }
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

  if (!isUpdateWatchlistBody(body)) {
    return NextResponse.json(
      { error: 'name, description, and visibility are required' },
      { status: 400 },
    )
  }

  try {
    const watchlist = await updateWatchlist(authResult.clerkUserId, slug, body)

    return NextResponse.json(watchlist)
  } catch (error) {
    return handlePayloadError(error)
  }
}

// Name, description, and visibility only. Payload trims text and checks length.
function isUpdateWatchlistBody(body: unknown): body is UpdateWatchlistInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return false
  }

  const record = body as Record<string, unknown>
  const keys = Object.keys(record)

  if (
    keys.length !== 3 ||
    !keys.includes('name') ||
    !keys.includes('description') ||
    !keys.includes('visibility')
  ) {
    return false
  }

  return (
    typeof record.name === 'string' &&
    (record.description === null || typeof record.description === 'string') &&
    isVisibility(record.visibility)
  )
}
