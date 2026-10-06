import type { Endpoint, PayloadRequest } from 'payload'

import type { LogWatchBody } from './types'

import { SKIP_COMPLETED_WATCH_EVENT } from '../../collections/library-items/context'
import { buildWatchEventLibraryItemProgressUpdate } from '../../collections/watch-events/utils/buildWatchEventLibraryItemProgressUpdate'
import { loadSeasonEpisodeCounts } from '../../collections/watch-events/utils/loadSeasonEpisodeCounts'
import { withLibraryItemRowLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { parseId, parseJsonBody, requireProfileContext, requireServiceAuth } from '../helpers'
import { createWatchEvent } from './create-watch-event'
import { deriveLogWatchRewatch, loadLogWatchRewatchContext } from './derive-rewatch'
import { parseLogWatchTvContext } from './parseLoggedEpisodes'
import { resolveOrCreateLibraryItem } from './resolve-or-create-library-item'

export const logWatchEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const body = await parseJsonBody<LogWatchBody>(req)

    if (body instanceof Response) {
      return body
    }

    const mediaId = parseId(body.mediaId)

    if (mediaId === null) {
      return Response.json({ error: 'mediaId is required' }, { status: 400 })
    }

    const parsedTvContext = parseLogWatchTvContext(body.tvContext)

    if (parsedTvContext instanceof Response) {
      return parsedTvContext
    }

    const { profileId } = profileResult
    const watchedAt = body.watchedAt ?? new Date().toISOString()

    const result = await runInPayloadTransaction(req, async () => {
      // Status from this request is applied after derive so a first watch is not classified as a rewatch.
      const libraryItemResult = await resolveOrCreateLibraryItem(req, {
        mediaId,
        profileId,
      })

      if (libraryItemResult instanceof Response) {
        return libraryItemResult
      }

      return withLibraryItemRowLock(req, libraryItemResult.id, async () => {
        const context = await loadLogWatchRewatchContext(req, libraryItemResult.id)
        const isTv = context.libraryItem.progress.type === 'tv'
        // Movies never carry episode coordinates, so a stray tvContext is dropped.
        const tvContext = isTv ? parsedTvContext : undefined
        const derived = deriveLogWatchRewatch(context, tvContext)
        const seasonProgress = isTv
          ? {
              seasonEpisodeCounts: await loadSeasonEpisodeCounts(req, mediaId),
              watchedEpisodeKeys: context.watchedEpisodeKeys,
            }
          : undefined

        const watchEvent = await createWatchEvent(req, {
          eventType: derived.eventType,
          isRewatch: derived.isRewatch,
          libraryItemId: libraryItemResult.id,
          mediaId,
          platform: body.platform,
          platformOther: body.platformOther,
          profileId,
          runtimeMinutes: body.runtimeMinutes,
          skipProgressSync: true,
          tvContext,
          visibility: body.visibility,
          watchedAt,
        })

        const libraryItem = await req.payload.update({
          collection: 'library-items',
          context: {
            [SKIP_COMPLETED_WATCH_EVENT]: true,
          },
          data: {
            lastWatchedAt: watchedAt,
            ...buildWatchEventLibraryItemProgressUpdate(
              {
                eventType: derived.eventType,
                isRewatch: derived.isRewatch,
                tvContext,
              },
              context.libraryItem,
              seasonProgress,
            ),
            ...(body.libraryItemStatus ? { status: body.libraryItemStatus } : {}),
          },
          depth: 0,
          id: libraryItemResult.id,
          overrideAccess: true,
          req,
        })

        // The watch-event hook is skipped, so stats are invalidated here once.
        await req.payload.update({
          collection: 'profiles',
          data: {
            statsCache: null,
          },
          id: profileId,
          overrideAccess: true,
          req,
        })

        return {
          libraryItem,
          watchEvent,
        }
      })
    })

    if (result instanceof Response) {
      return result
    }

    return Response.json(result)
  },
  method: 'post',
  path: '/library/log-watch',
}
