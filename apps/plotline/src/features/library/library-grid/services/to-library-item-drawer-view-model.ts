import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'

import type { MediaDisplay } from '@/features/media-grid/types'

import {
  formatReleaseYear,
  formatRuntime,
  formatTvDurationLabel,
  getMediaId,
} from '@/features/media-grid/grid/services/media-display-helpers'

import type {
  LibraryItemDrawerProgress,
  LibraryItemDrawerViewModel,
  LibraryItemDrawerWatchlist,
  LibraryItemSource,
} from '../types'

const LIBRARY_ITEM_SOURCE_LABELS: Record<LibraryItemSource, string> = {
  import: 'Import',
  manual: 'Manual',
  recommendation: 'Recommendation',
}

type ToLibraryItemDrawerViewModelInput = {
  item: LibraryItem
  media: Media
  mediaDisplay: MediaDisplay
  memberships?: WatchlistMembership[]
}

export function getLibraryItemSourceLabel(source: LibraryItemSource | null): null | string {
  if (!source) {
    return null
  }

  return LIBRARY_ITEM_SOURCE_LABELS[source]
}

export function toLibraryItemDrawerViewModel({
  item,
  media,
  mediaDisplay,
  memberships = [],
}: ToLibraryItemDrawerViewModelInput): LibraryItemDrawerViewModel {
  const releaseYear = formatReleaseYear(mediaDisplay.releaseDate)
  const mediaTypeLabel = mediaDisplay.mediaType === 'movie' ? 'Film' : 'Series'

  return {
    completedAt: item.completedAt ?? null,
    episodeCount: mediaDisplay.mediaType === 'tv' ? (mediaDisplay.episodeCount ?? null) : null,
    lastWatchedAt: item.lastWatchedAt ?? null,
    libraryItemId: item.id,
    media: mediaDisplay,
    mediaId: getMediaId(media),
    mediaType: mediaDisplay.mediaType,
    mediaTypeLabel,
    personalNotes: item.personalNotes ?? null,
    progress: toLibraryItemDrawerProgress(item.progress),
    releaseYear,
    rewatchCount: item.rewatchCount ?? null,
    runtimeLabel: mediaDisplay.mediaType === 'movie' ? formatRuntime(mediaDisplay.runtime) : null,
    seasonCount: mediaDisplay.mediaType === 'tv' ? (mediaDisplay.seasonCount ?? null) : null,
    source: item.source ?? null,
    startedAt: item.startedAt ?? null,
    status: item.status,
    title: mediaDisplay.title,
    tvDurationLabel:
      mediaDisplay.mediaType === 'tv'
        ? formatTvDurationLabel(mediaDisplay.seasonCount, mediaDisplay.episodeCount)
        : null,
    watchlists: toLibraryItemDrawerWatchlists(memberships),
  }
}

function toLibraryItemDrawerProgress(progress: LibraryItem['progress']): LibraryItemDrawerProgress {
  if (progress.type === 'movie') {
    return {
      type: 'movie',
      watched: progress.watched ?? null,
    }
  }

  return {
    episodesWatched: progress.episodesWatched ?? null,
    lastEpisode: progress.lastEpisode ?? null,
    lastSeason: progress.lastSeason ?? null,
    seasonsCompleted: progress.seasonsCompleted ?? null,
    type: 'tv',
  }
}

function toLibraryItemDrawerWatchlists(
  memberships: WatchlistMembership[],
): LibraryItemDrawerWatchlist[] {
  return memberships.flatMap((membership) => {
    const watchlist = membership.watchlist

    if (typeof watchlist !== 'object') {
      return []
    }

    return [
      {
        id: watchlist.id,
        name: watchlist.name,
        slug: watchlist.slug,
      },
    ]
  })
}
