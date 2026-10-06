import { NextResponse } from 'next/server'

import { getWatchlists } from '@/features/watchlists/services/get-watchlists'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

const VALID_FILTERS = new Set(['challenge', 'custom', 'system'])

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter')

  if (filter && !VALID_FILTERS.has(filter)) {
    return NextResponse.json({ error: 'Invalid filter' }, { status: 400 })
  }

  try {
    const watchlists = await getWatchlists(authResult.clerkUserId, {
      filter: filter as 'challenge' | 'custom' | 'system' | undefined,
    })

    return NextResponse.json(watchlists)
  } catch (error) {
    return handlePayloadError(error)
  }
}
