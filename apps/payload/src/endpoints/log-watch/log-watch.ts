import type { Endpoint, PayloadRequest } from 'payload'

import type { LogWatchBody } from './types'

import { parseId, parseJsonBody, requireProfileContext, requireServiceAuth } from '../helpers'
import { createWatchEvent } from './create-watch-event'
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

    if (mediaId === null || !body.eventType) {
      return Response.json({ error: 'mediaId and eventType are required' }, { status: 400 })
    }

    const { profileId } = profileResult

    const libraryItemResult = await resolveOrCreateLibraryItem(req, {
      libraryItemStatus: body.libraryItemStatus,
      mediaId,
      profileId,
    })

    if (libraryItemResult instanceof Response) {
      return libraryItemResult
    }

    const watchEvent = await createWatchEvent(req, {
      eventType: body.eventType,
      isRewatch: body.isRewatch,
      libraryItemId: libraryItemResult.id,
      mediaId,
      platform: body.platform,
      platformOther: body.platformOther,
      profileId,
      runtimeMinutes: body.runtimeMinutes,
      tvContext: body.tvContext,
      visibility: body.visibility,
      watchedAt: body.watchedAt,
    })

    return Response.json({
      libraryItem: libraryItemResult,
      watchEvent,
    })
  },
  method: 'post',
  path: '/library/log-watch',
}
