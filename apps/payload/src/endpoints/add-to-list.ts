import type { MediaStatus } from '@plotline/shared/constants/media'
import type { Endpoint, PayloadRequest } from 'payload'

import { getRelationId, relationIdsMatch } from '../utilities/relations'
import { parseId, parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'

type AddToListBody = {
  mediaId: number | string
  note?: string
  status?: MediaStatus
  watchlistId?: number | string
  watchlistSlug?: string
}

export const addToListEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const body = await parseJsonBody<AddToListBody>(req)

    if (body instanceof Response) {
      return body
    }

    const mediaId = parseId(body.mediaId)

    if (mediaId === null) {
      return Response.json({ error: 'mediaId is required' }, { status: 400 })
    }

    if (body.watchlistId == null && body.watchlistSlug == null) {
      return Response.json({ error: 'watchlistId or watchlistSlug is required' }, { status: 400 })
    }

    const watchlistId = body.watchlistId != null ? parseId(body.watchlistId) : null

    if (body.watchlistId != null && watchlistId === null) {
      return Response.json({ error: 'watchlistId must be a valid number' }, { status: 400 })
    }

    const { profileId } = profileResult

    const watchlists = await req.payload.find({
      collection: 'watchlists',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: watchlistId
        ? {
            id: {
              equals: watchlistId,
            },
          }
        : {
            and: [
              {
                owner: {
                  equals: profileId,
                },
              },
              {
                slug: {
                  equals: body.watchlistSlug,
                },
              },
            ],
          },
    })

    const watchlist = watchlists.docs[0]

    if (!watchlist) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    if (!relationIdsMatch(getRelationId(watchlist.owner), profileId)) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    const media = await req.payload.findByID({
      collection: 'media',
      depth: 0,
      id: mediaId,
      overrideAccess: true,
    })

    if (!media) {
      return Response.json({ error: 'Media not found' }, { status: 404 })
    }

    const existingLibraryItems = await req.payload.find({
      collection: 'library-items',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ profile: { equals: profileId } }, { media: { equals: mediaId } }],
      },
    })

    const libraryItem =
      existingLibraryItems.docs[0] ??
      (await req.payload.create({
        collection: 'library-items',
        data: {
          media: mediaId,
          profile: profileId,
          progress: {
            type: media.mediaType,
            watched: media.mediaType === 'movie' ? false : undefined,
          },
          source: 'manual',
          status: body.status ?? 'planned',
        },
        overrideAccess: true,
        req,
      }))

    const existingMembership = await req.payload.find({
      collection: 'watchlist-memberships',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ watchlist: { equals: watchlist.id } }, { libraryItem: { equals: libraryItem.id } }],
      },
    })

    const membership =
      existingMembership.docs[0] ??
      (await req.payload.create({
        collection: 'watchlist-memberships',
        data: {
          addedAt: new Date().toISOString(),
          libraryItem: libraryItem.id,
          note: body.note,
          watchlist: watchlist.id,
        },
        overrideAccess: true,
        req,
      }))

    return Response.json({
      libraryItem,
      membership,
      watchlist,
    })
  },
  method: 'post',
  path: '/library/add-to-list',
}
