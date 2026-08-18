import type { CollectionAfterChangeHook } from 'payload'

import { getRelationId } from '../../../utilities/relations'
import {
  SKIP_COMPLETED_WATCH_EVENT,
  SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT,
} from '../../library-items/context'
import { buildTvProgressUpdate } from '../utils/buildTvProgressUpdate'
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

    if (!skipProgressSync && doc.eventType === 'progress' && doc.tvContext) {
      await withLibraryItemRowLock(req, libraryItemId, async () => {
        const libraryItem = await req.payload.findByID({
          collection: 'library-items',
          depth: 0,
          id: libraryItemId,
          overrideAccess: true,
          req,
        })

        updateData.progress = buildTvProgressUpdate(doc.tvContext, libraryItem?.progress, {
          isRewatch: doc.isRewatch ?? false,
        })

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
