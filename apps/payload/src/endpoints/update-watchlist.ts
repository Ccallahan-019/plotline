import type { Endpoint, PayloadRequest } from 'payload'

import { findOwnedWatchlistBySlug } from './find-owned-watchlist-by-slug'
import { parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'
import { parseWatchlistWrite } from './parse-watchlist-write'
import { libraryOwnsMedia, mediaRelationId } from './watchlist-cover-media'
import { readWatchlistSlug } from './watchlist-route-params'

/**
 * Updates the details of one owned watchlist.
 *
 * `PATCH /api/watchlists/:slug/details` requires name, description, visibility,
 * cover, and challenge settings. The slug stays put so the page URL does not
 * change. A new cover must be a title in the owner's library; keeping the
 * current cover does not require that check again. System lists can change
 * name, description, visibility, and cover, but cannot turn challenge mode on.
 * Missing and unowned lists are both not found.
 */
export const updateWatchlistEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const slug = readWatchlistSlug(req)

    if (!slug) {
      return Response.json({ error: 'Watchlist slug is required' }, { status: 400 })
    }

    const body = await parseJsonBody<unknown>(req)

    if (body instanceof Response) {
      return body
    }

    const write = parseWatchlistWrite(body)

    if (write instanceof Response) {
      return write
    }

    const watchlist = await findOwnedWatchlistBySlug(req, profileResult.profileId, slug)

    if (!watchlist) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    if (watchlist.isSystem === true && write.challenge.enabled) {
      return Response.json({ error: 'System lists cannot be challenges' }, { status: 400 })
    }

    if (write.coverMedia != null && write.coverMedia !== mediaRelationId(watchlist.coverMedia)) {
      const owned = await libraryOwnsMedia(req, profileResult.profileId, write.coverMedia)

      if (!owned) {
        return Response.json(
          { error: 'Cover must be a title in your library' },
          { status: 400 },
        )
      }
    }

    const updated = await req.payload.update({
      collection: 'watchlists',
      data: write,
      depth: 1,
      id: watchlist.id,
      overrideAccess: true,
      req,
    })

    return Response.json(updated)
  },
  method: 'patch',
  path: '/:slug/details',
}
