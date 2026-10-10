import type { MediaStatus } from '@plotline/shared/constants'
import type { Endpoint, PayloadRequest } from 'payload'

import { withLibraryItemCreateLock } from '../collections/watch-events/utils/withLibraryItemRowLock'
import { getRelationId, relationIdsMatch } from '../utilities/relations'
import { runInPayloadTransaction } from '../utilities/runInPayloadTransaction'
import { parseId, parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'
import { resolveMedia, type ResolveMediaBody } from './resolve-media'

type AddToListBody = {
  note?: string
  status?: MediaStatus
  watchlistId?: number | string
  watchlistSlug?: string
} & ResolveMediaBody

/**
 * Adds catalog media to one of the current profile's watchlists.
 *
 * `POST /api/library/add-to-list` resolves the watchlist by id or slug, then
 * finds or creates the profile's library item and the list membership. Those
 * two writes share one transaction and the `(profile, media)` advisory lock, so
 * a concurrent add waits and reuses the committed rows instead of colliding on
 * the unique indexes.
 */
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

    const mediaResult = await resolveMedia(req, body)

    if (mediaResult instanceof Response) {
      return mediaResult
    }

    const media = mediaResult
    const mediaId = media.id

    // Membership create stays inside this lock. It is held until commit, so a
    // second add of the same title sees both rows instead of hitting the unique indexes.
    const { libraryItem, membership } = await runInPayloadTransaction(req, () =>
      withLibraryItemCreateLock(req, profileId, mediaId, async () => {
        const existingLibraryItems = await req.payload.find({
          collection: 'library-items',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          req,
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
          req,
          where: {
            and: [
              { watchlist: { equals: watchlist.id } },
              { libraryItem: { equals: libraryItem.id } },
            ],
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

        return { libraryItem, membership }
      }),
    )

    return Response.json({
      libraryItem,
      membership,
      watchlist,
    })
  },
  method: 'post',
  path: '/library/add-to-list',
}
