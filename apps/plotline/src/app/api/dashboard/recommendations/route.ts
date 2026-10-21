import { createTmdbClient, TmdbError } from '@plotline/shared/tmdb'
import { NextResponse } from 'next/server'

import { getDashboardRecommendations } from '@/features/dashboard/services/get-dashboard-recommendations'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'
import { tmdbErrorResponse } from '@/lib/api/tmdb-error-response'

export async function GET() {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN

  if (!accessToken) {
    return NextResponse.json({ error: 'TMDB is not configured' }, { status: 503 })
  }

  try {
    const recommendations = await getDashboardRecommendations(
      authResult.clerkUserId,
      createTmdbClient(accessToken),
    )

    return NextResponse.json(recommendations)
  } catch (error) {
    if (error instanceof TmdbError) {
      return tmdbErrorResponse(error, { notFound: 'Title not found' })
    }

    return handlePayloadError(error)
  }
}
