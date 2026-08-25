import type { MediaStatus, StreamingPlatform } from '@plotline/shared/constants'

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
  season: number
}

export type LogWatchBody = {
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
