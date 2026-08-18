import type { WatchEvent } from '@plotline/payload-types'
import type {
  StreamingPlatform,
  WatchEventType,
} from '@plotline/shared/constants/media'
import type { PayloadRequest } from 'payload'

import { SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT } from '../../collections/library-items/context'

export type CreateWatchEventInput = {
  eventType: WatchEventType
  isRewatch?: boolean
  libraryItemId: number
  mediaId: number
  platform?: StreamingPlatform
  platformOther?: string
  profileId: number
  runtimeMinutes?: number
  skipProgressSync?: boolean
  tvContext?: {
    episode?: number
    season?: number
  }
  visibility?: 'friends' | 'private' | 'public'
  watchedAt?: string
}

export async function createWatchEvent(
  req: PayloadRequest,
  input: CreateWatchEventInput,
): Promise<WatchEvent> {
  const {
    eventType,
    isRewatch,
    libraryItemId,
    mediaId,
    platform,
    platformOther,
    profileId,
    runtimeMinutes,
    skipProgressSync,
    tvContext,
    visibility,
    watchedAt,
  } = input

  return req.payload.create({
    collection: 'watch-events',
    context: skipProgressSync
      ? {
          [SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT]: true,
        }
      : undefined,
    data: {
      eventType,
      isRewatch: isRewatch ?? false,
      libraryItem: libraryItemId,
      media: mediaId,
      platform,
      platformOther,
      profile: profileId,
      runtimeMinutes,
      tvContext,
      visibility: visibility ?? 'private',
      watchedAt: watchedAt ?? new Date().toISOString(),
    },
    overrideAccess: true,
    req,
  })
}
