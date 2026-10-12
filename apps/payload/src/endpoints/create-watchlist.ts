import type { Endpoint, PayloadRequest } from 'payload'

import { parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'
import { parseWatchlistWrite } from './parse-watchlist-write'
import { libraryOwnsMedia } from './watchlist-cover-media'
import { allocateWatchlistSlug } from './watchlist-slug'

/**
 * Creates an owned watchlist.
 *
 * `POST /api/watchlists/create` sets the owner from the signed-in profile and
 * generates a unique `owner + slug` from the name. The slug is not accepted
 * from the client. A cover must be a title already in the profile's library.
 * System flags stay at their defaults, so this route cannot create a system list.
 */
export const createWatchlistEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const body = await parseJsonBody<unknown>(req)

    if (body instanceof Response) {
      return body
    }

    const write = parseWatchlistWrite(body)

    if (write instanceof Response) {
      return write
    }

    if (write.coverMedia != null) {
      const owned = await libraryOwnsMedia(req, profileResult.profileId, write.coverMedia)

      if (!owned) {
        return Response.json(
          { error: 'Cover must be a title in your library' },
          { status: 400 },
        )
      }
    }

    const slug = await allocateWatchlistSlug(req, profileResult.profileId, write.name)

    if (!slug) {
      return Response.json({ error: 'Could not create a unique watchlist url' }, { status: 409 })
    }

    try {
      const created = await req.payload.create({
        collection: 'watchlists',
        data: {
          ...write,
          owner: profileResult.profileId,
          slug,
        },
        depth: 1,
        overrideAccess: true,
        req,
      })

      return Response.json(created)
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error
      }
    }

    const retrySlug = await allocateWatchlistSlug(req, profileResult.profileId, write.name)

    if (!retrySlug || retrySlug === slug) {
      return Response.json({ error: 'Could not create a unique watchlist url' }, { status: 409 })
    }

    const created = await req.payload.create({
      collection: 'watchlists',
      data: {
        ...write,
        owner: profileResult.profileId,
        slug: retrySlug,
      },
      depth: 1,
      overrideAccess: true,
      req,
    })

    return Response.json(created)
  },
  method: 'post',
  path: '/create',
}

// Postgres unique violations surface as 23505, sometimes wrapped on `cause`.
function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const record = error as { cause?: unknown; code?: unknown; message?: unknown }

  if (record.code === '23505') {
    return true
  }

  if (typeof record.message === 'string' && /duplicate key|unique constraint/i.test(record.message)) {
    return true
  }

  return isUniqueViolation(record.cause)
}
