import type { Media } from '@plotline/payload-types'
import type { Endpoint, PayloadRequest } from 'payload'

import type { LogWatchBody } from './types'

import { SKIP_COMPLETED_WATCH_EVENT } from '../../collections/library-items/context'
import { buildWatchEventLibraryItemProgressUpdate } from '../../collections/watch-events/utils/buildWatchEventLibraryItemProgressUpdate'
import { withLibraryItemRowLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { parseId, parseJsonBody, requireProfileContext, requireServiceAuth } from '../helpers'
import { createWatchEvent } from './create-watch-event'
import { deriveLogWatchRewatch, loadLogWatchRewatchContext } from './derive-rewatch'
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
        const derived = deriveLogWatchRewatch(context, body.tvContext)
        const seasonProgress =
          context.libraryItem.progress.type === 'tv'
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
          tvContext: body.tvContext,
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
                tvContext: body.tvContext,
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

/**
 * Stored per-season lengths for the locked TV progress update.
 *
 * This is a local media read. Log-watch must not call TMDB under the row lock, and a
 * missing `tvMeta` leaves `seasonsCompleted` to be copied through rather than guessed.
 *
 * @param req - Payload request (uses the open transaction when present)
 * @param mediaId - Media row whose `tvMeta.seasonEpisodeCounts` to read
 * @returns Season lengths, or `undefined` when the media row has no TV metadata
 */
async function loadSeasonEpisodeCounts(
  req: PayloadRequest,
  mediaId: number,
): Promise<NonNullable<Media['tvMeta']>['seasonEpisodeCounts'] | undefined> {
  const media = await req.payload.findByID({
    collection: 'media',
    depth: 0,
    id: mediaId,
    overrideAccess: true,
    req,
  })

  return media?.tvMeta?.seasonEpisodeCounts
}
