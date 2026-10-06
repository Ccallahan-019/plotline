import type { LibraryItem } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

import { withLibraryItemCreateLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'

export type ResolveOrCreateLibraryItemInput = {
  mediaId: number
  profileId: number
}

/**
 * Finds the profile's library item for a media row, creating a `watching` item if missing.
 *
 * Status from the log-watch request is deliberately not accepted here: callers apply it
 * after rewatch classification so a first watch is not classified against the new status.
 * Runs under an advisory lock so concurrent first logs do not race on the unique index.
 *
 * @param req - Payload request with an open transaction
 * @param input - Profile and media to resolve
 * @returns The library item, or a 404 response when the media row does not exist
 */
export async function resolveOrCreateLibraryItem(
  req: PayloadRequest,
  input: ResolveOrCreateLibraryItemInput,
): Promise<LibraryItem | Response> {
  const { mediaId, profileId } = input

  return withLibraryItemCreateLock(req, profileId, mediaId, async () => {
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

    const existingLibraryItem = existingLibraryItems.docs[0]

    if (existingLibraryItem) {
      return existingLibraryItem
    }

    const media = await req.payload.findByID({
      collection: 'media',
      depth: 0,
      id: mediaId,
      overrideAccess: true,
      req,
    })

    if (!media) {
      return Response.json({ error: 'Media not found' }, { status: 404 })
    }

    return req.payload.create({
      collection: 'library-items',
      data: {
        media: mediaId,
        profile: profileId,
        progress: {
          type: media.mediaType,
          watched: media.mediaType === 'movie' ? false : undefined,
        },
        source: 'manual',
        status: 'watching',
      },
      overrideAccess: true,
      req,
    })
  })
}
