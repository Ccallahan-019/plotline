import type { Endpoint, PayloadRequest } from 'payload'

import {
  isVisibility,
  type Visibility,
  WATCHLIST_DESCRIPTION_MAX_LENGTH,
  WATCHLIST_NAME_MAX_LENGTH,
} from '@plotline/shared/constants'

import { findOwnedWatchlistBySlug } from './find-owned-watchlist-by-slug'
import { parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'
import { readWatchlistSlug } from './watchlist-route-params'

const PATCH_FIELDS = new Set(['description', 'name', 'visibility'])

type WatchlistDetailsPatch = {
  description: null | string
  name: string
  visibility: Visibility
}

/**
 * Updates the name, description, and visibility of one owned watchlist.
 *
 * `PATCH /api/watchlists/:slug/details` requires all three fields. The slug
 * stays put so the page URL does not change. Blank descriptions are stored as
 * `null`. Any other field is rejected so owner, slug, and system flags cannot
 * be changed from this route. Missing and unowned lists are both not found.
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

    const patch = parseWatchlistDetailsPatch(body)

    if (patch instanceof Response) {
      return patch
    }

    const watchlist = await findOwnedWatchlistBySlug(req, profileResult.profileId, slug)

    if (!watchlist) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    const updated = await req.payload.update({
      collection: 'watchlists',
      data: patch,
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

/**
 * Accepts a watchlist details patch of `name`, `description`, and `visibility`.
 *
 * All three fields are required. Names and descriptions are trimmed. A blank
 * description is stored as `null`.
 *
 * @param body - Parsed JSON body
 * @returns Fields to write, or a 400 response
 */
function parseWatchlistDetailsPatch(body: unknown): Response | WatchlistDetailsPatch {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Request body must be an object' }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const keys = Object.keys(record)

  if (keys.some((key) => !PATCH_FIELDS.has(key))) {
    return Response.json(
      { error: 'Only name, description, and visibility can be updated' },
      { status: 400 },
    )
  }

  if (!keys.includes('name') || !keys.includes('description') || !keys.includes('visibility')) {
    return Response.json(
      { error: 'name, description, and visibility are required' },
      { status: 400 },
    )
  }

  if (typeof record.name !== 'string') {
    return Response.json({ error: 'name must be a string' }, { status: 400 })
  }

  const name = record.name.trim()

  if (name.length === 0) {
    return Response.json({ error: 'Enter a name' }, { status: 400 })
  }

  if (name.length > WATCHLIST_NAME_MAX_LENGTH) {
    return Response.json(
      { error: `Name must be ${WATCHLIST_NAME_MAX_LENGTH} characters or fewer` },
      { status: 400 },
    )
  }

  if (record.description !== null && typeof record.description !== 'string') {
    return Response.json({ error: 'description must be a string or null' }, { status: 400 })
  }

  const description = typeof record.description === 'string' ? record.description.trim() : ''

  if (description.length > WATCHLIST_DESCRIPTION_MAX_LENGTH) {
    return Response.json(
      {
        error: `Description must be ${WATCHLIST_DESCRIPTION_MAX_LENGTH} characters or fewer`,
      },
      { status: 400 },
    )
  }

  if (!isVisibility(record.visibility)) {
    return Response.json(
      { error: 'visibility must be private, friends, public, or unlisted' },
      { status: 400 },
    )
  }

  return {
    description: description.length === 0 ? null : description,
    name,
    visibility: record.visibility,
  }
}
