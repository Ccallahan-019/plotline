import { NextResponse } from 'next/server'

import { getReviews } from '@/features/library/services/get-reviews'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { searchParams } = new URL(request.url)
  const hasBodyParam = searchParams.get('hasBody')

  let hasBody: boolean | undefined

  if (hasBodyParam === 'true') {
    hasBody = true
  } else if (hasBodyParam === 'false') {
    hasBody = false
  } else if (hasBodyParam !== null) {
    return NextResponse.json({ error: 'Invalid hasBody filter' }, { status: 400 })
  }

  try {
    const reviews = await getReviews(authResult.clerkUserId, { hasBody })

    return NextResponse.json(reviews)
  } catch (error) {
    return handlePayloadError(error)
  }
}
