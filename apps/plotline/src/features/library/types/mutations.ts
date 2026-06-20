import type {
  LibraryItem,
  WatchEvent,
  Watchlist,
  WatchlistMembership,
} from '@plotline/payload-types'
import type {
  MediaStatus,
  MediaType,
  StreamingPlatform,
  WatchEventType,
} from '@plotline/shared/constants/media'

export type AddToListInput = {
  /** Payload media ID — use when media already exists in the system. */
  mediaId?: number | string
  mediaType?: MediaType
  note?: string
  overview?: null | string
  posterPath?: null | string
  releaseDate?: null | string
  runtime?: null | number
  status?: MediaStatus
  title?: string
  tmdbId?: number
  tvMeta?: {
    episodeCount?: null | number
  }
  voteAverage?: null | number
  watchlistId?: number | string
  watchlistSlug?: string
}

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
export type AddToListTmdbMediaInput = Pick<
  AddToListInput,
  'overview' | 'posterPath' | 'releaseDate' | 'runtime' | 'tvMeta' | 'voteAverage'
> &
  Required<Pick<AddToListInput, 'mediaType' | 'title' | 'tmdbId'>>

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
