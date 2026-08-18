import { NextResponse } from 'next/server'

import { logWatchBatchEvent } from '@/features/library/library-grid/services/log-watch-batch-event'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function POST(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const result = await logWatchBatchEvent(authResult.clerkUserId, body)

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}
