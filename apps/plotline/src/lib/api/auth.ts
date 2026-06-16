import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { PayloadClientError } from '@/lib/payload/client'

export function handlePayloadError(error: unknown): NextResponse {
  if (error instanceof PayloadClientError) {
    return NextResponse.json(error.body ?? { error: error.message }, {
      status: error.status,
    })
  }

  console.error(error)

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export async function requireClerkUserId(): Promise<
  { clerkUserId: string } | NextResponse
> {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return { clerkUserId: userId }
}
