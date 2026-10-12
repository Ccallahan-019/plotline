import { NextResponse } from 'next/server'

import { getWatchlistBySlug } from '@/features/watchlists/services/get-watchlists'
import { updateWatchlist } from '@/features/watchlists/services/update-watchlist'
import { parseWatchlistWriteBody } from '@/features/watchlists/services/watchlist-write'
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

  const parsed = parseWatchlistWriteBody(body)

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  try {
    const watchlist = await updateWatchlist(authResult.clerkUserId, slug, parsed.value)

    return NextResponse.json(watchlist)
  } catch (error) {
    return handlePayloadError(error)
  }
}
