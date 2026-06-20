import { NextResponse } from 'next/server'

import { addToList } from '@/features/library/add-to-list/services/add-to-list'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function POST(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const body = await request.json()
    const result = await addToList(authResult.clerkUserId, body)

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}
