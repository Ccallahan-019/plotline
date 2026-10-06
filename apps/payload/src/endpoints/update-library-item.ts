import type { Endpoint, PayloadRequest } from 'payload'

import { MEDIA_STATUSES, type MediaStatus } from '@plotline/shared/constants'

import { parseId, parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'

const PATCH_FIELDS = new Set<string>(['personalNotes', 'status'])

type LibraryItemPatchData = {
  personalNotes?: null | string
  status?: MediaStatus
}

/**
 * Owner-scoped status and notes update for one library item.
 *
 * `PATCH /api/library/library-items/:id` accepts only `{ status?, personalNotes? }`
 * and requires at least one. Missing and unowned items are both not found.
 * The write is a `library-items` update, so status dates, the completed watch
 * event, and watchlist membership sync still run.
 */
export const updateLibraryItemEndpoint: Endpoint = {
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
      return Response.json({ error: 'Library item id is required' }, { status: 400 })
    }

    const body = await parseJsonBody<unknown>(req)

    if (body instanceof Response) {
      return body
    }

    const patch = parseLibraryItemPatch(body)

    if (patch instanceof Response) {
      return patch
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

    const libraryItem = await req.payload.update({
      collection: 'library-items',
      data: patch,
      depth: 0,
      id: libraryItemId,
      overrideAccess: true,
      req,
    })

    return Response.json({ libraryItem })
  },
  method: 'patch',
  path: '/library/library-items/:id',
}

function isMediaStatus(value: unknown): value is MediaStatus {
  return MEDIA_STATUSES.some((status) => status === value)
}

/**
 * Accepts a library-item patch of `status` and/or `personalNotes`.
 *
 * Blank notes are stored as `null`. Any other field is rejected so progress,
 * profile, and media cannot be changed from this route.
 *
 * @param body - Parsed JSON body
 * @returns Fields to write, or a 400 response
 */
function parseLibraryItemPatch(body: unknown): LibraryItemPatchData | Response {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Request body must be an object' }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const keys = Object.keys(record)

  if (keys.some((key) => !PATCH_FIELDS.has(key))) {
    return Response.json({ error: 'Only status and personalNotes can be updated' }, { status: 400 })
  }

  if (keys.length === 0) {
    return Response.json(
      { error: 'At least one of status or personalNotes is required' },
      { status: 400 },
    )
  }

  const data: LibraryItemPatchData = {}

  if ('status' in record) {
    if (!isMediaStatus(record.status)) {
      return Response.json(
        { error: 'status must be planned, watching, completed, dropped, or on_hold' },
        { status: 400 },
      )
    }

    data.status = record.status
  }

  if ('personalNotes' in record) {
    const notes = record.personalNotes

    if (notes !== null && typeof notes !== 'string') {
      return Response.json({ error: 'personalNotes must be a string or null' }, { status: 400 })
    }

    const trimmed = notes?.trim() ?? ''

    data.personalNotes = trimmed.length === 0 ? null : trimmed
  }

  return data
}

// Positive library-item ids only. `0` and non-integers never reach the owner lookup.
function readLibraryItemId(req: PayloadRequest): null | number {
  const parsed = parseId(req.routeParams?.id as number | string | undefined)

  if (parsed == null || !Number.isInteger(parsed) || parsed < 1) {
    return null
  }

  return parsed
}
