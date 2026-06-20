import { NextResponse } from 'next/server'

import { getLibraryItems } from '@/features/library/library-grid/services/get-library-items'
import { parseLibraryItemsQuery } from '@/features/library/library-grid/services/parse-library-items-query'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

export async function GET(request: Request) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { searchParams } = new URL(request.url)
  const query = parseLibraryItemsQuery(searchParams)

  try {
    const result = await getLibraryItems(authResult.clerkUserId, query.filters, {
      page: query.page,
      pageSize: query.pageSize,
    })

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}
