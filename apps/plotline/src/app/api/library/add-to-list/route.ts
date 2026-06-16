import { NextResponse } from 'next/server'

import { handlePayloadError, requireClerkUserId } from '@/lib/api/auth'
import { addToList } from '@/lib/payload'

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
