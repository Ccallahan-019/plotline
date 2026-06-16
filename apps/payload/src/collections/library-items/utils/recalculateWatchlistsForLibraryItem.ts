import { Payload, PayloadRequest } from 'payload'

import { recalculateWatchlistStatsById } from '@/utilities/recalculateWatchlistStatsById'
import { getRelationId } from '@/utilities/relations'

export async function recalculateWatchlistsForLibraryItem(
  payload: Payload,
  libraryItemId: number | string,
  req?: PayloadRequest,
): Promise<void> {
  const memberships = await payload.find({
    collection: 'watchlist-memberships',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
    where: {
      libraryItem: {
        equals: libraryItemId,
      },
    },
  })

  const watchlistIds = new Set<number | string>()

  for (const membership of memberships.docs) {
    const watchlistId = getRelationId(membership.watchlist)

    if (watchlistId != null) {
      watchlistIds.add(watchlistId)
    }
  }

  await Promise.all(
    [...watchlistIds].map((watchlistId) =>
      recalculateWatchlistStatsById(payload, watchlistId, req),
    ),
  )
}
