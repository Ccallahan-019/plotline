import { NextResponse } from 'next/server'

import { removeLibraryItem } from '@/features/library/library-item/services/remove-library-item'
import { updateLibraryItem } from '@/features/library/library-item/services/update-library-item'
import { handlePayloadError } from '@/lib/api/handle-payload-error'
import { requireClerkUserId } from '@/lib/api/require-clerk-user-id'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { id } = await context.params

  try {
    const result = await removeLibraryItem(authResult.clerkUserId, id)

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { id } = await context.params

  try {
    const body = await request.json()
    const result = await updateLibraryItem(authResult.clerkUserId, id, body)

    return NextResponse.json(result)
  } catch (error) {
    return handlePayloadError(error)
  }
}
