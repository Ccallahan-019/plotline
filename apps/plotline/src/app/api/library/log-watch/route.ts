import { NextResponse } from 'next/server'

import { logWatchEvent } from '@/features/library/library-grid/services/log-watch-event'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function POST(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const result = await logWatchEvent(authResult.clerkUserId, body)

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}
