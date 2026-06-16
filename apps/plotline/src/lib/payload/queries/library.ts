import type { LibraryItem, WatchEvent, Watchlist, WatchlistMembership } from '@plotline/payload-types'
import type { MediaStatus, StreamingPlatform, WatchEventType } from '@plotline/shared/constants/media'

import { payloadFetch } from '../client'

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

export async function addToList(
  clerkUserId: string,
  input: AddToListInput,
): Promise<AddToListResult> {
  return payloadFetch<AddToListResult>('/api/library/add-to-list', {
    body: input,
    clerkUserId,
    method: 'POST',
  })
}

export async function logWatchEvent(
  clerkUserId: string,
  input: LogWatchInput,
): Promise<LogWatchResult> {
  return payloadFetch<LogWatchResult>('/api/library/log-watch', {
    body: input,
    clerkUserId,
    method: 'POST',
  })
}
