import type {
  MediaStatus,
  StreamingPlatform,
  WatchEventType,
} from '@plotline/shared/constants/media'

export type LogWatchBody = {
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
