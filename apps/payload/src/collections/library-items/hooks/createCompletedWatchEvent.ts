import type { LibraryItem, Media } from '@plotline/payload-types'
import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

import { getRelationId } from '../../../utilities/relations'
import { positiveRuntimeMinutes } from '../../watch-events/utils/watch-event-runtime'
import { SKIP_COMPLETED_WATCH_EVENT } from '../context'

export const createCompletedWatchEvent: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  req.context ??= {}

  if (context[SKIP_COMPLETED_WATCH_EVENT] || req.context[SKIP_COMPLETED_WATCH_EVENT]) {
    return doc
  }

  if (operation !== 'update' || doc.status !== 'completed' || previousDoc?.status === 'completed') {
    return doc
  }

  const runtimeMinutes = await movieRuntimeForStatusCompletion(req, doc.media)

  await req.payload.create({
    collection: 'watch-events',
    data: {
      eventType: 'completed',
      libraryItem: doc.id,
      media: doc.media,
      profile: doc.profile,
      ...(runtimeMinutes != null ? { runtimeMinutes } : {}),
      visibility: 'private',
      watchedAt: doc.completedAt ?? new Date().toISOString(),
    },
    overrideAccess: true,
    req,
  })

  return doc
}

/**
 * Film length copied onto a watch event created by marking a movie completed.
 *
 * A series marked completed is one event with no episodes, so it stays without a
 * runtime. Episode logs already carry their own lengths.
 *
 * @param req - Payload request, used to load the catalog row when it is not populated
 * @param mediaRelation - Media id or populated media on the library item
 * @returns Minutes for a movie, or `undefined` for a series or a missing length
 */
async function movieRuntimeForStatusCompletion(
  req: PayloadRequest,
  mediaRelation: LibraryItem['media'],
): Promise<number | undefined> {
  const media = await resolveMedia(req, mediaRelation)

  if (media?.mediaType !== 'movie') {
    return undefined
  }

  return positiveRuntimeMinutes(media.runtime)
}

// Populated media is used as-is. An id is loaded so a depth-0 status update still sees runtime.
async function resolveMedia(
  req: PayloadRequest,
  mediaRelation: LibraryItem['media'],
): Promise<Media | null> {
  if (typeof mediaRelation === 'object' && mediaRelation != null) {
    return mediaRelation
  }

  const mediaId = getRelationId(mediaRelation)

  if (mediaId == null) {
    return null
  }

  const media = await req.payload.findByID({
    collection: 'media',
    depth: 0,
    id: mediaId,
    overrideAccess: true,
    req,
  })

  return media ?? null
}
