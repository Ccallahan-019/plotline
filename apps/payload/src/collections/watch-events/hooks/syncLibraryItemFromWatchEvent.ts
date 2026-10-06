import type { WatchEvent } from '@plotline/payload-types'
import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

import {
  deriveLogWatchRewatch,
  loadLogWatchRewatchContext,
} from '../../../endpoints/log-watch/derive-rewatch'
import { getRelationId } from '../../../utilities/relations'
import {
  SKIP_COMPLETED_WATCH_EVENT,
  SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT,
} from '../../library-items/context'
import {
  buildWatchEventLibraryItemProgressUpdate,
  hasTvEpisodeContext,
  isRewatchWatchEvent,
  type WatchEventLibraryItemProgressUpdate,
} from '../utils/buildWatchEventLibraryItemProgressUpdate'
import { loadSeasonEpisodeCounts } from '../utils/loadSeasonEpisodeCounts'
import { withLibraryItemRowLock } from '../utils/withLibraryItemRowLock'

/**
 * Syncs the library item and profile stats after a watch event is created outside log-watch.
 *
 * Log-watch endpoints set `SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT` and do all of this once per
 * request, so the hook returns immediately for them. Other creators (admin, REST) get the
 * same classification as log-watch: TV episodes are checked against existing watched keys,
 * so a repeated episode does not increase `episodesWatched`, and completed seasons are
 * recomputed from stored season lengths.
 */
export const syncLibraryItemFromWatchEvent: CollectionAfterChangeHook<WatchEvent> = async ({
  context,
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create' || context[SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT]) {
    return doc
  }

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

    if (shouldSyncTvProgress || shouldSyncMovieWatch) {
      await withLibraryItemRowLock(req, libraryItemId, async () => {
        Object.assign(updateData, await buildLockedProgressUpdate(req, doc, Number(libraryItemId)))

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

// Classifies a TV episode against existing coverage (excluding this event), then builds the patch.
async function buildLockedProgressUpdate(
  req: PayloadRequest,
  doc: WatchEvent,
  libraryItemId: number,
): Promise<WatchEventLibraryItemProgressUpdate> {
  const rewatchContext = await loadLogWatchRewatchContext(req, libraryItemId, {
    excludeEventId: doc.id,
  })
  const { libraryItem } = rewatchContext

  if (libraryItem.progress.type !== 'tv' || !hasTvEpisodeContext(doc.tvContext)) {
    return buildWatchEventLibraryItemProgressUpdate(doc, libraryItem)
  }

  const derived = deriveLogWatchRewatch(rewatchContext, doc.tvContext)
  const mediaId = getRelationId(doc.media)

  return buildWatchEventLibraryItemProgressUpdate(
    { ...doc, isRewatch: derived.isRewatch || isRewatchWatchEvent(doc) },
    libraryItem,
    {
      seasonEpisodeCounts:
        mediaId != null ? await loadSeasonEpisodeCounts(req, Number(mediaId)) : undefined,
      watchedEpisodeKeys: rewatchContext.watchedEpisodeKeys,
    },
  )
}
