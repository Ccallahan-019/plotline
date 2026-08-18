import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants/media'
import type { PayloadRequest } from 'payload'

import { SKIP_COMPLETED_WATCH_EVENT } from '../../collections/library-items/context'

export type ResolveOrCreateLibraryItemInput = {
  libraryItemStatus?: MediaStatus
  mediaId: number
  profileId: number
}

export async function resolveOrCreateLibraryItem(
  req: PayloadRequest,
  input: ResolveOrCreateLibraryItemInput,
): Promise<LibraryItem | Response> {
  const { libraryItemStatus, mediaId, profileId } = input

  const existingLibraryItems = await req.payload.find({
    collection: 'library-items',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ profile: { equals: profileId } }, { media: { equals: mediaId } }],
    },
  })

  let libraryItem = existingLibraryItems.docs[0]

  if (!libraryItem) {
    const media = await req.payload.findByID({
      collection: 'media',
      depth: 0,
      id: mediaId,
      overrideAccess: true,
    })

    if (!media) {
      return Response.json({ error: 'Media not found' }, { status: 404 })
    }

    libraryItem = await req.payload.create({
      collection: 'library-items',
      data: {
        media: mediaId,
        profile: profileId,
        progress: {
          type: media.mediaType,
          watched: media.mediaType === 'movie' ? false : undefined,
        },
        source: 'manual',
        status: libraryItemStatus ?? 'watching',
      },
      overrideAccess: true,
      req,
    })
  } else if (libraryItemStatus) {
    libraryItem = await req.payload.update({
      collection: 'library-items',
      context: {
        [SKIP_COMPLETED_WATCH_EVENT]: true,
      },
      data: {
        status: libraryItemStatus,
      },
      id: libraryItem.id,
      overrideAccess: true,
      req,
    })
  }

  return libraryItem
}
