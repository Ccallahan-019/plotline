import type { CollectionAfterChangeHook } from 'payload'

import { getRelationId } from '../../../utilities/relations'
import { SKIP_COMPLETED_WATCH_EVENT } from '../../library-items/context'
import { buildTvProgressUpdate } from '../utils/buildTvProgressUpdate'

export const syncLibraryItemFromWatchEvent: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') {
    return doc
  }

  const libraryItemId = getRelationId(doc.libraryItem)

  if (libraryItemId != null) {
    const updateData: Record<string, unknown> = {
      lastWatchedAt: doc.watchedAt,
    }

    if (doc.eventType === 'progress' && doc.tvContext) {
      updateData.progress = buildTvProgressUpdate(doc.tvContext)
    }

    await req.payload.update({
      collection: 'library-items',
      context: {
        [SKIP_COMPLETED_WATCH_EVENT]: true,
      },
      data: updateData,
      id: libraryItemId,
      overrideAccess: true,
      req,
    })
  }

  const profileId = getRelationId(doc.profile)

  if (profileId != null) {
    await req.payload.update({
      collection: 'profiles',
      data: {
        statsCache: null,
      },
      id: profileId,
      overrideAccess: true,
      req,
    })
  }

  return doc
}
