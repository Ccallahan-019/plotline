import type { Endpoint, PayloadRequest } from 'payload'

import { toNonNegativeInteger } from '@plotline/shared/utils'

import { loadWatchedEpisodePairs } from '../collections/watch-events/utils/loadWatchedEpisodePairs'
import { requireProfileContext, requireServiceAuth } from './helpers'

/**
 * Owner-scoped TV episode coverage for one library item.
 *
 * `GET /api/library/watched-episodes?libraryItemId=` returns unique `{ season, episode }`
 * pairs from watch events that include `tvContext`. Movies and titles with no episode
 * coverage return an empty array. Missing and unowned items are both not found.
 */
export const watchedEpisodesEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const libraryItemId = readLibraryItemId(req)

    if (libraryItemId === null) {
      return Response.json({ error: 'libraryItemId is required' }, { status: 400 })
    }

    const ownedItems = await req.payload.find({
      collection: 'library-items',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      where: {
        and: [
          { id: { equals: libraryItemId } },
          { profile: { equals: profileResult.profileId } },
        ],
      },
    })

    const libraryItem = ownedItems.docs[0]

    if (!libraryItem) {
      return Response.json({ error: 'Library item not found' }, { status: 404 })
    }

    if (libraryItem.progress.type !== 'tv') {
      return Response.json([])
    }

    const episodes = await loadWatchedEpisodePairs(req, libraryItemId)

    return Response.json(episodes)
  },
  method: 'get',
  path: '/library/watched-episodes',
}

// Positive library-item ids only. `0` and non-integers never reach the owner lookup.
function readLibraryItemId(req: PayloadRequest): null | number {
  if (!req.url) {
    return null
  }

  let value: null | string

  try {
    value = new URL(req.url, 'http://localhost').searchParams.get('libraryItemId')
  } catch {
    return null
  }

  const parsed = toNonNegativeInteger(value)

  if (parsed == null || parsed < 1) {
    return null
  }

  return parsed
}
