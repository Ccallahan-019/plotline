import { APIError, type CollectionBeforeDeleteHook } from 'payload'

export const preventSystemWatchlistDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const watchlist = await req.payload.findByID({
    collection: 'watchlists',
    depth: 0,
    id,
    overrideAccess: true,
  })

  if (!watchlist) {
    throw new APIError('Watchlist not found', 404)
  }

  if (watchlist.isSystem) {
    throw new APIError('System watchlists cannot be deleted', 400)
  }
}
