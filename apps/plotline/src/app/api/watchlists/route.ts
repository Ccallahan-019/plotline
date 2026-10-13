import { NextResponse } from 'next/server'

import type { WatchlistListFilter } from '@/features/watchlists/types'

import { createWatchlist } from '@/features/watchlists/editor/services/create-watchlist'
import { parseWatchlistWriteBody } from '@/features/watchlists/editor/services/watchlist-write'
import { getWatchlists } from '@/features/watchlists/services/get-watchlists'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

const VALID_FILTERS = new Set<WatchlistListFilter>(['challenge', 'custom', 'list', 'system'])

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter')

  if (filter && !isWatchlistListFilter(filter)) {
    return NextResponse.json({ error: 'Invalid filter' }, { status: 400 })
  }

  try {
    const watchlists = await getWatchlists(authResult.clerkUserId, {
      filter: isWatchlistListFilter(filter) ? filter : undefined,
    })

    return NextResponse.json(watchlists)
  } catch (error) {
    return handlePayloadError(error)
  }
}

export async function POST(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

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
    const watchlist = await createWatchlist(authResult.clerkUserId, parsed.value)

    return NextResponse.json(watchlist)
  } catch (error) {
    return handlePayloadError(error)
  }
}

function isWatchlistListFilter(value: null | string): value is WatchlistListFilter {
  return value != null && VALID_FILTERS.has(value as WatchlistListFilter)
}
