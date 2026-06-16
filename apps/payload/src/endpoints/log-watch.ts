import type {
  MediaStatus,
  StreamingPlatform,
  WatchEventType,
} from '@plotline/shared/constants/media'
import type { Endpoint, PayloadRequest } from 'payload'

import { SKIP_COMPLETED_WATCH_EVENT } from '../collections/library-items/context'
import { parseId, parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'

type LogWatchBody = {
  eventType: WatchEventType
  isRewatch?: boolean
  libraryItemStatus?: MediaStatus
  mediaId: number | string
  platform?: StreamingPlatform
  platformOther?: string
  runtimeMinutes?: number
  tvContext?: {
    episode?: number
    season?: number
  }
  visibility?: 'friends' | 'private' | 'public'
  watchedAt?: string
}

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

    if (mediaId === null || !body.eventType) {
      return Response.json({ error: 'mediaId and eventType are required' }, { status: 400 })
    }

    const { profileId } = profileResult

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
          status: body.libraryItemStatus ?? 'watching',
        },
        overrideAccess: true,
        req,
      })
    } else if (body.libraryItemStatus) {
      libraryItem = await req.payload.update({
        collection: 'library-items',
        context: {
          [SKIP_COMPLETED_WATCH_EVENT]: true,
        },
        data: {
          status: body.libraryItemStatus,
        },
        id: libraryItem.id,
        overrideAccess: true,
        req,
      })
    }

    const watchEvent = await req.payload.create({
      collection: 'watch-events',
      data: {
        eventType: body.eventType,
        isRewatch: body.isRewatch ?? false,
        libraryItem: libraryItem.id,
        media: mediaId,
        platform: body.platform,
        platformOther: body.platformOther,
        profile: profileId,
        runtimeMinutes: body.runtimeMinutes,
        tvContext: body.tvContext,
        visibility: body.visibility ?? 'private',
        watchedAt: body.watchedAt ?? new Date().toISOString(),
      },
      overrideAccess: true,
      req,
    })

    return Response.json({
      libraryItem,
      watchEvent,
    })
  },
  method: 'post',
  path: '/library/log-watch',
}
