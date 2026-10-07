import type { Endpoint, PayloadRequest } from 'payload'

import { withLibraryItemRowLock } from '../collections/watch-events/utils/withLibraryItemRowLock'
import { recalculateWatchlistStatsById } from '../utilities/recalculateWatchlistStatsById'
import { getRelationId } from '../utilities/relations'
import { runInPayloadTransaction } from '../utilities/runInPayloadTransaction'
import { readLibraryItemRouteId, requireProfileContext, requireServiceAuth } from './helpers'

type LibraryItemChildCollection = 'watch-events' | 'watchlist-memberships'

/**
 * Removes one owned library item and permanently deletes its watch history.
 *
 * `DELETE /api/library/library-items/:id` drops watchlist memberships, recalculates
 * those watchlists (membership `afterChange` does not run on delete), deletes watch
 * events before the library row so the foreign key cannot block removal, then
 * deletes the library item and clears the profile stats cache. Reviews stay; they
 * are keyed by profile and media. Missing and unowned items are both not found.
 * The writes commit together so a failure does not leave history half-deleted, and
 * they run under the library item's row lock so log-watch cannot interleave.
 */
export const removeLibraryItemEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const libraryItemId = readLibraryItemRouteId(req)

    if (libraryItemId === null) {
      return Response.json({ error: 'Library item id is required' }, { status: 400 })
    }

    const ownedItems = await req.payload.find({
      collection: 'library-items',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        and: [{ id: { equals: libraryItemId } }, { profile: { equals: profileResult.profileId } }],
      },
    })

    if (!ownedItems.docs[0]) {
      return Response.json({ error: 'Library item not found' }, { status: 404 })
    }

    await runInPayloadTransaction(req, () =>
      // Same row lock as log-watch, so a concurrent log cannot insert a watch event
      // between the event delete and the library row delete.
      withLibraryItemRowLock(req, libraryItemId, async () => {
        // Ids are read first. Membership afterChange does not run on delete, so each
        // watchlist is recalculated only after its row is gone and no longer counted.
        const watchlistIds = await loadAffectedWatchlistIds(req, libraryItemId)

        await deleteByLibraryItem(req, 'watchlist-memberships', libraryItemId)

        for (const watchlistId of watchlistIds) {
          await recalculateWatchlistStatsById(req.payload, watchlistId, req)
        }

        // Watch events go before the library row so the foreign key cannot block removal.
        await deleteByLibraryItem(req, 'watch-events', libraryItemId)

        await req.payload.delete({
          collection: 'library-items',
          id: libraryItemId,
          overrideAccess: true,
          req,
        })

        await req.payload.update({
          collection: 'profiles',
          data: {
            statsCache: null,
          },
          id: profileResult.profileId,
          overrideAccess: true,
          req,
        })
      }),
    )

    return Response.json({ id: libraryItemId })
  },
  method: 'delete',
  path: '/library/library-items/:id',
}

/**
 * Deletes every row in `collection` whose `libraryItem` is this id.
 *
 * Bulk delete reports per-row failures instead of throwing. Any failure throws
 * so the surrounding transaction rolls the removal back.
 *
 * @param req - Payload request, including the active transaction
 * @param collection - Child collection that references the library item
 * @param libraryItemId - Library item being removed
 * @throws When one or more matching rows could not be deleted
 */
async function deleteByLibraryItem(
  req: PayloadRequest,
  collection: LibraryItemChildCollection,
  libraryItemId: number,
): Promise<void> {
  const result = await req.payload.delete({
    collection,
    overrideAccess: true,
    req,
    where: {
      libraryItem: {
        equals: libraryItemId,
      },
    },
  })

  if (result.errors.length > 0) {
    throw new Error(`Failed to delete ${collection} for the library item`)
  }
}

/**
 * Watchlists that currently include this library item.
 *
 * `limit: 0` loads every membership. A truncated page would skip recalculating a
 * watchlist whose membership this request is about to delete.
 *
 * @param req - Payload request, including the active transaction
 * @param libraryItemId - Library item being removed
 * @returns De-duplicated watchlist ids, in membership order
 */
async function loadAffectedWatchlistIds(
  req: PayloadRequest,
  libraryItemId: number,
): Promise<Array<number | string>> {
  const memberships = await req.payload.find({
    collection: 'watchlist-memberships',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    req,
    select: {
      watchlist: true,
    },
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

  return [...watchlistIds]
}

