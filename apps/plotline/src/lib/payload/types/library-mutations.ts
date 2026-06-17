import type { LibraryItem, WatchEvent, Watchlist, WatchlistMembership } from '@plotline/payload-types'
import type { MediaStatus, StreamingPlatform, WatchEventType } from '@plotline/shared/constants/media'

export type AddToListInput = {
  mediaId: number | string
  note?: string
  status?: MediaStatus
  watchlistId?: number | string
  watchlistSlug?: string
}

export type AddToListResult = {
  libraryItem: LibraryItem
  membership: WatchlistMembership
  watchlist: Watchlist
}

export type LogWatchInput = {
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

export type LogWatchResult = {
  libraryItem: LibraryItem
  watchEvent: WatchEvent
}
