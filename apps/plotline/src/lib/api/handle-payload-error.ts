import { NextResponse } from 'next/server'

import { PayloadClientError } from '@/lib/payload/payload-fetch'

export function handlePayloadError(error: unknown): NextResponse {
  if (error instanceof PayloadClientError) {
    return NextResponse.json(error.body ?? { error: error.message }, {
      status: error.status,
    })
  }

  console.error(error)

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
