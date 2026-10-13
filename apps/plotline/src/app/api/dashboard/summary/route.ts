import { NextResponse } from 'next/server'

import { getDashboardSummary } from '@/features/dashboard/services/get-dashboard-summary'
import { parseDashboardSummaryQuery } from '@/features/dashboard/services/parse-dashboard-query'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const parsed = parseDashboardSummaryQuery(new URL(request.url).searchParams)

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  try {
    const summary = await getDashboardSummary(authResult.clerkUserId, parsed.value)

    return NextResponse.json(summary)
  } catch (error) {
    return handlePayloadError(error)
  }
}
