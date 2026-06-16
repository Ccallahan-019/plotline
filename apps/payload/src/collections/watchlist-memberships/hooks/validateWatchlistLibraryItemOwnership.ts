import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { getRelationId, relationIdsMatch } from '../../../utilities/relations'

export const validateWatchlistLibraryItemOwnership: CollectionBeforeValidateHook = async ({
  data,
  req,
}) => {
  if (!data?.watchlist || !data.libraryItem) {
    return data
  }

  const watchlistId = getRelationId(data.watchlist)
  const libraryItemId = getRelationId(data.libraryItem)

  if (watchlistId == null || libraryItemId == null) {
    return data
  }

  const [watchlist, libraryItem] = await Promise.all([
    req.payload.findByID({
      collection: 'watchlists',
      depth: 0,
      id: watchlistId,
      overrideAccess: true,
    }),
    req.payload.findByID({
      collection: 'library-items',
      depth: 0,
      id: libraryItemId,
      overrideAccess: true,
    }),
  ])

  if (!watchlist) {
    throw new APIError('Watchlist not found', 404)
  }

  if (!libraryItem) {
    throw new APIError('Library item not found', 404)
  }

  if (!relationIdsMatch(getRelationId(libraryItem.profile), getRelationId(watchlist.owner))) {
    throw new APIError('Library item profile must match watchlist owner', 400)
  }

  return data
}
