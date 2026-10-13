import { NextResponse } from 'next/server'

import { getDashboardActivity } from '@/features/dashboard/services/get-dashboard-activity'
import {
  DashboardQueryError,
  parseDashboardActivityQuery,
} from '@/features/dashboard/services/parse-dashboard-query'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const parsed = parseDashboardActivityQuery(new URL(request.url).searchParams)

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  try {
    const page = await getDashboardActivity(authResult.clerkUserId, parsed.value)

    return NextResponse.json(page)
  } catch (error) {
    if (error instanceof DashboardQueryError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return handlePayloadError(error)
  }
}
