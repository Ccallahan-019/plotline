import type {
  LibraryItem,
  WatchEvent,
  Watchlist,
  WatchlistMembership,
} from '@plotline/payload-types'
import type {
  MediaReleaseStatus,
  MediaStatus,
  StreamingPlatform,
  WatchEventType,
} from '@plotline/shared/constants/media'
import type { TmdbUpsertMediaInput } from '@plotline/shared/tmdb'

export type AddToListInput = {
  /** Payload media ID — use when media already exists in the system. */
  mediaId?: number | string
  note?: string
  status?: MediaStatus
  watchlistId?: number | string
  watchlistSlug?: string
} & AddToListMediaFields

export type AddToListResult = {
  libraryItem: LibraryItem
  membership: WatchlistMembership
  watchlist: Watchlist
}

/** Shape the add-to-library popover will collect before fan-out to per-list calls. */
export type AddToListsFormInput = {
  media: { mediaId: number | string } | AddToListTmdbMediaInput
  note?: string
  status?: MediaStatus
  watchlistIds: Array<number | string>
}

/** TMDB metadata passed when upserting media server-side during add-to-list. */
export type AddToListTmdbMediaInput = AddToListMediaFields &
  Required<Pick<AddToListInput, 'mediaType' | 'title' | 'tmdbId'>>

export type LogWatchBatchInput = {
  episodes: Array<{
    episode: number
    isRewatch?: boolean
    season: number
  }>
  libraryItemStatus?: MediaStatus
  mediaId: number | string
  platform?: StreamingPlatform
  platformOther?: string
  visibility?: 'friends' | 'private' | 'public'
  watchedAt?: string
}

export type LogWatchBatchResult = {
  libraryItem: LibraryItem
  watchEvents: WatchEvent[]
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

type AddToListMediaFields = {
  /** Media release lifecycle status — distinct from library item `status`. */
  releaseStatus?: MediaReleaseStatus | null
} & Partial<Omit<TmdbUpsertMediaInput, 'metadataSyncedAt' | 'status'>>

export function buildAddToListInputs({
  media,
  note,
  status,
  watchlistIds,
}: AddToListsFormInput): AddToListInput[] {
  const mediaFields = hasAddToListMediaId(media) ? { mediaId: media.mediaId } : media

  return watchlistIds.map((watchlistId) => ({
    ...mediaFields,
    note,
    status,
    watchlistId,
  }))
}

export function hasAddToListMediaId(
  input: AddToListInput | AddToListsFormInput['media'],
): input is { mediaId: number | string } {
  return 'mediaId' in input && input.mediaId != null
}

export function hasAddToListTmdbRef(
  input: AddToListInput | AddToListsFormInput['media'],
): input is AddToListTmdbMediaInput {
  return 'tmdbId' in input && input.tmdbId != null && 'mediaType' in input
}
