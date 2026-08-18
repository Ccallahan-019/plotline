import type {
  MediaStatus,
  StreamingPlatform,
  WatchEventType,
} from '@plotline/shared/constants/media'

export type LogWatchBatchBody = {
  episodes: LogWatchBatchEpisode[]
  libraryItemStatus?: MediaStatus
  mediaId: number | string
  platform?: StreamingPlatform
  platformOther?: string
  visibility?: 'friends' | 'private' | 'public'
  watchedAt?: string
}

export type LogWatchBatchEpisode = {
  episode: number
  isRewatch?: boolean
  season: number
}

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
