import type { CollectionAfterChangeHook } from 'payload'

import { getRelationId } from '../../../utilities/relations'
import {
  SKIP_COMPLETED_WATCH_EVENT,
  SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT,
} from '../../library-items/context'
import {
  buildWatchEventLibraryItemProgressUpdate,
  hasTvEpisodeContext,
  isRewatchWatchEvent,
} from '../utils/buildWatchEventLibraryItemProgressUpdate'
import { withLibraryItemRowLock } from '../utils/withLibraryItemRowLock'

export const syncLibraryItemFromWatchEvent: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') {
    return doc
  }

  req.context ??= {}

  const skipProgressSync = Boolean(
    context[SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT] ||
      req.context[SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT],
  )

  const libraryItemId = getRelationId(doc.libraryItem)

  if (libraryItemId != null) {
    const updateData: Record<string, unknown> = {
      lastWatchedAt: doc.watchedAt,
    }

    const applyLibraryItemUpdate = async () => {
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

    const shouldSyncTvProgress = hasTvEpisodeContext(doc.tvContext)
    const shouldSyncMovieWatch = doc.eventType === 'completed' || isRewatchWatchEvent(doc)

    if (!skipProgressSync && (shouldSyncTvProgress || shouldSyncMovieWatch)) {
      await withLibraryItemRowLock(req, libraryItemId, async () => {
        const libraryItem = await req.payload.findByID({
          collection: 'library-items',
          depth: 0,
          id: libraryItemId,
          overrideAccess: true,
          req,
        })

        Object.assign(updateData, buildWatchEventLibraryItemProgressUpdate(doc, libraryItem))

        await applyLibraryItemUpdate()
      })
    } else {
      await applyLibraryItemUpdate()
    }
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
