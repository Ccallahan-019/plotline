import type { Endpoint, PayloadRequest } from 'payload'

import { isMediaStatus, type MediaStatus } from '@plotline/shared/constants'

import { withLibraryItemCreateLock } from '../collections/watch-events/utils/withLibraryItemRowLock'
import { runInPayloadTransaction } from '../utilities/runInPayloadTransaction'
import { parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'
import { resolveMedia, type ResolveMediaBody } from './resolve-media'

type CreateLibraryItemBody = {
  status?: MediaStatus
} & ResolveMediaBody

/**
 * Creates a library item for the current profile from catalog media.
 *
 * `POST /api/library/library-items` accepts an existing `mediaId` or TMDB
 * fields, plus an optional library `status` (default `planned`). An existing
 * `(profile, media)` row returns 409. The lookup and insert share one transaction
 * and `withLibraryItemCreateLock`, so a concurrent create waits and then returns
 * 409 instead of colliding on the unique index. The new row uses `source: 'manual'`
 * and sets `progress.type` from the media type (`watched: false` for movies).
 * Status dates are stamped by the collection hook. A completed watch event is not
 * emitted here; that hook only runs on update.
 */
export const createLibraryItemEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const body = await parseJsonBody<CreateLibraryItemBody>(req)

    if (body instanceof Response) {
      return body
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json({ error: 'Request body must be an object' }, { status: 400 })
    }

    const status = readCreateStatus(body)

    if (status instanceof Response) {
      return status
    }

    const mediaResult = await resolveMedia(req, body)

    if (mediaResult instanceof Response) {
      return mediaResult
    }

    const { profileId } = profileResult
    const media = mediaResult

    const libraryItem = await runInPayloadTransaction(req, () =>
      withLibraryItemCreateLock(req, profileId, media.id, async () => {
        const existingLibraryItems = await req.payload.find({
          collection: 'library-items',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          req,
          where: {
            and: [{ profile: { equals: profileId } }, { media: { equals: media.id } }],
          },
        })

        if (existingLibraryItems.docs[0]) {
          return Response.json({ error: 'Library item already exists' }, { status: 409 })
        }

        return req.payload.create({
          collection: 'library-items',
          data: {
            media: media.id,
            profile: profileId,
            progress: {
              type: media.mediaType,
              watched: media.mediaType === 'movie' ? false : undefined,
            },
            source: 'manual',
            status: status ?? 'planned',
          },
          depth: 0,
          overrideAccess: true,
          req,
        })
      }),
    )

    if (libraryItem instanceof Response) {
      return libraryItem
    }

    return Response.json({ libraryItem })
  },
  method: 'post',
  path: '/library/library-items',
}

/**
 * Reads an optional library status from a create body.
 *
 * Omitted status means the caller wants the `planned` default. A present but
 * invalid status is rejected before media is upserted.
 *
 * @param body - Parsed create body; `status` is untrusted JSON
 * @returns The status to store, `undefined` when omitted, or a 400 response
 */
function readCreateStatus(body: { status?: unknown }): MediaStatus | Response | undefined {
  if (body.status === undefined) {
    return undefined
  }

  if (!isMediaStatus(body.status)) {
    return Response.json(
      { error: 'status must be planned, watching, completed, dropped, or on_hold' },
      { status: 400 },
    )
  }

  return body.status
}
