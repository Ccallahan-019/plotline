import type { WatchEvent } from '@plotline/payload-types'
import type { Endpoint, PayloadRequest } from 'payload'

import type { LogWatchBatchBody } from './types'

import { SKIP_COMPLETED_WATCH_EVENT } from '../../collections/library-items/context'
import { buildBatchTvProgressUpdate } from '../../collections/watch-events/utils/buildBatchTvProgressUpdate'
import { withLibraryItemRowLock } from '../../collections/watch-events/utils/withLibraryItemRowLock'
import { runInPayloadTransaction } from '../../utilities/runInPayloadTransaction'
import { parseId, parseJsonBody, requireProfileContext, requireServiceAuth } from '../helpers'
import { createWatchEvent } from './create-watch-event'
import { parseLoggedEpisodes } from './parseLoggedEpisodes'
import { resolveOrCreateLibraryItem } from './resolve-or-create-library-item'

export const logWatchBatchEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const body = await parseJsonBody<LogWatchBatchBody>(req)

    if (body instanceof Response) {
      return body
    }

    const mediaId = parseId(body.mediaId)

    if (mediaId === null) {
      return Response.json({ error: 'mediaId is required' }, { status: 400 })
    }

    const episodes = parseLoggedEpisodes(body.episodes)

    if (episodes instanceof Response) {
      return episodes
    }

    const { profileId } = profileResult

    const media = await req.payload.findByID({
      collection: 'media',
      depth: 0,
      id: mediaId,
      overrideAccess: true,
    })

    if (!media) {
      return Response.json({ error: 'Media not found' }, { status: 404 })
    }

    if (media.mediaType !== 'tv') {
      return Response.json(
        { error: 'Batch log-watch is only supported for TV shows' },
        { status: 400 },
      )
    }

    const watchedAt = body.watchedAt ?? new Date().toISOString()

    const result = await runInPayloadTransaction(req, async () => {
      const libraryItemResult = await resolveOrCreateLibraryItem(req, {
        mediaId,
        profileId,
      })

      if (libraryItemResult instanceof Response) {
        return libraryItemResult
      }

      return withLibraryItemRowLock(req, libraryItemResult.id, async () => {
        const watchEvents: WatchEvent[] = []

        for (const episode of episodes) {
          watchEvents.push(
            await createWatchEvent(req, {
              eventType: episode.isRewatch ? 'rewatched' : 'progress',
              isRewatch: episode.isRewatch,
              libraryItemId: libraryItemResult.id,
              mediaId,
              platform: body.platform,
              platformOther: body.platformOther,
              profileId,
              skipProgressSync: true,
              tvContext: {
                episode: episode.episode,
                season: episode.season,
              },
              visibility: body.visibility,
              watchedAt,
            }),
          )
        }

        const libraryItem = await req.payload.findByID({
          collection: 'library-items',
          depth: 0,
          id: libraryItemResult.id,
          overrideAccess: true,
          req,
        })

        const updatedLibraryItem = await req.payload.update({
          collection: 'library-items',
          context: {
            [SKIP_COMPLETED_WATCH_EVENT]: true,
          },
          data: {
            lastWatchedAt: watchedAt,
            progress: buildBatchTvProgressUpdate(episodes, libraryItem.progress),
            ...(body.libraryItemStatus ? { status: body.libraryItemStatus } : {}),
          },
          depth: 0,
          id: libraryItemResult.id,
          overrideAccess: true,
          req,
        })

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
          libraryItem: updatedLibraryItem,
          watchEvents,
        }
      })
    })

    if (result instanceof Response) {
      return result
    }

    return Response.json(result)
  },
  method: 'post',
  path: '/library/log-watch/batch',
}
