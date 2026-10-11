import 'server-only'

import type { LibraryItem, Media, WatchEvent, WatchlistMembership } from '@plotline/payload-types'
import type { MediaType } from '@plotline/shared/constants'
import type { TmdbUpsertMediaInput } from '@plotline/shared/tmdb'

import {
  createTmdbClient,
  mapMovieDetailsToUpsertInput,
  mapTvDetailsToUpsertInput,
  TmdbError,
} from '@plotline/shared/tmdb'
import { cache } from 'react'

import { getProfileWatchRegion } from '@/features/search/services/get-profile-watch-region'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

import type { MediaTitleMembership, MediaTitlePageData, MediaTitleWatchEvent } from '../types'

import {
  mapMovieTitleDetails,
  type MappedMediaTitleDetails,
  mapTvTitleDetails,
  seasonsFromMedia,
} from './map-media-title-details'
import { MediaTitleNotFoundError } from './media-title-errors'

const CATALOG_REFRESH_MS = 24 * 60 * 60 * 1000
const ACTIVITY_LIMIT = 20

/**
 * Loads the title page for one TMDB id.
 *
 * Refreshes the catalog row from TMDB when it is missing or older than a day, then
 * attaches the signed-in user's library item, watchlist memberships, and recent
 * watch events. Metadata and page loads in the same request share one call.
 * A TMDB miss with no cached row throws `MediaTitleNotFoundError`. When TMDB fails
 * and a cached row exists, the page still renders from that row.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id
 * @returns Catalog media plus the viewer's library state and overview fields
 * @throws {MediaTitleNotFoundError} When TMDB and the catalog both lack the title
 * @throws {Error} When TMDB is not configured and the title is not cached
 */
export const getMediaTitlePage = cache(async function getMediaTitlePage(
  clerkUserId: string,
  mediaType: MediaType,
  tmdbId: number,
): Promise<MediaTitlePageData> {
  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN
  const regionPromise = getProfileWatchRegion(clerkUserId)
  const cachedPromise = findCachedMedia(clerkUserId, mediaType, tmdbId)

  const loaded = accessToken
    ? await loadTmdbTitle(createTmdbClient(accessToken), mediaType, tmdbId)
    : { details: null, error: new Error('TMDB is not configured') }

  const [region, cached] = await Promise.all([regionPromise, cachedPromise])
  const media = await resolveCatalogMedia(clerkUserId, cached, loaded)

  if (!media) {
    if (loaded.details) {
      throw new MediaTitleNotFoundError()
    }

    if (loaded.error instanceof TmdbError && loaded.error.status === 404) {
      throw new MediaTitleNotFoundError()
    }

    throw loaded.error instanceof Error ? loaded.error : new MediaTitleNotFoundError()
  }

  const detailFields = loaded.details
    ? loaded.details.mediaType === 'movie'
      ? mapMovieTitleDetails(loaded.details.details, region)
      : mapTvTitleDetails(loaded.details.details, region)
    : detailsFromCachedMedia(media)

  const [libraryItem, watchEvents] = await Promise.all([
    findLibraryItem(clerkUserId, media.id),
    findWatchEvents(clerkUserId, media.id),
  ])
  const populatedLibraryItem = libraryItem ? withMedia(libraryItem, media) : null
  const memberships = populatedLibraryItem
    ? await findMemberships(clerkUserId, populatedLibraryItem.id)
    : []

  return {
    ...detailFields,
    libraryItem: populatedLibraryItem,
    media,
    memberships,
    region,
    watchEvents,
  }
})

type LoadedTmdbTitle =
  | { details: { details: Parameters<typeof mapMovieTitleDetails>[0]; mediaType: 'movie' } }
  | { details: { details: Parameters<typeof mapTvTitleDetails>[0]; mediaType: 'tv' } }
  | { details: null; error: unknown }

/**
 * Overview fields available from the catalog row alone.
 *
 * @param media - Stored catalog row used when TMDB details were not loaded
 * @returns Empty credits, certification, and review ratings, with the stored vote average and seasons
 */
function detailsFromCachedMedia(media: Media): MappedMediaTitleDetails {
  return {
    cast: [],
    certification: null,
    createdBy: [],
    crew: [],
    directors: [],
    keyCredits: [],
    language: null,
    networks: [],
    releaseStatusLabel: null,
    seasons: seasonsFromMedia(media),
    voteAverage: media.voteAverage ?? null,
    voteCount: null,
  }
}

/**
 * Finds the catalog row for a TMDB id.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param mediaType - `movie` or `tv`
 * @param tmdbId - TMDB title id
 * @returns The media document, or `null` when it has not been cached
 */
async function findCachedMedia(
  clerkUserId: string,
  mediaType: MediaType,
  tmdbId: number,
): Promise<Media | null> {
  const result = await payloadFetch<PayloadPaginatedDocs<Media>>('/api/media', {
    clerkUserId,
    method: 'GET',
    searchParams: {
      depth: 0,
      limit: 1,
      'where[mediaType][equals]': mediaType,
      'where[tmdbId][equals]': tmdbId,
    },
  })

  return result.docs[0] ?? null
}

/**
 * Loads the signed-in user's library row for this catalog media, when they have one.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param mediaId - Payload media id
 * @returns The library item, or `null` when the title is not in the library
 */
async function findLibraryItem(clerkUserId: string, mediaId: number): Promise<LibraryItem | null> {
  const result = await payloadFetch<PayloadPaginatedDocs<LibraryItem>>('/api/library-items', {
    clerkUserId,
    method: 'GET',
    searchParams: {
      depth: 1,
      limit: 1,
      'where[media][equals]': mediaId,
    },
  })

  return result.docs[0] ?? null
}

/**
 * Loads watchlist memberships for a library item.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param libraryItemId - Library item whose memberships to load
 * @returns Memberships whose watchlist was populated, newest-independent of list order
 */
async function findMemberships(
  clerkUserId: string,
  libraryItemId: number,
): Promise<MediaTitleMembership[]> {
  const result = await payloadFetch<PayloadPaginatedDocs<WatchlistMembership>>(
    '/api/watchlist-memberships',
    {
      clerkUserId,
      method: 'GET',
      searchParams: {
        depth: 1,
        limit: 100,
        'where[libraryItem][equals]': libraryItemId,
      },
    },
  )

  return result.docs.flatMap((membership) => {
    const watchlist = membership.watchlist

    if (typeof watchlist !== 'object' || watchlist == null) {
      return []
    }

    return [
      {
        id: membership.id,
        watchlistName: watchlist.name,
        watchlistSlug: watchlist.slug,
      },
    ]
  })
}

/**
 * Loads recent watch events for this title.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param mediaId - Payload media id
 * @returns Newest events first, capped for the activity tab
 */
async function findWatchEvents(
  clerkUserId: string,
  mediaId: number,
): Promise<MediaTitleWatchEvent[]> {
  const result = await payloadFetch<PayloadPaginatedDocs<WatchEvent>>('/api/watch-events', {
    clerkUserId,
    method: 'GET',
    searchParams: {
      depth: 0,
      limit: ACTIVITY_LIMIT,
      sort: '-watchedAt',
      'where[media][equals]': mediaId,
    },
  })

  return result.docs.map((event) => ({
    episode: event.tvContext?.episode ?? null,
    eventType: event.eventType,
    id: event.id,
    platform: event.platform ?? null,
    platformOther: event.platformOther ?? null,
    runtimeMinutes: event.runtimeMinutes ?? null,
    season: event.tvContext?.season ?? null,
    watchedAt: event.watchedAt,
  }))
}

/**
 * True when the catalog row should be written again from TMDB.
 *
 * @param media - Stored catalog row
 * @returns `true` when `metadataSyncedAt` is missing or older than a day
 */
function isCatalogStale(media: Media): boolean {
  if (!media.metadataSyncedAt) {
    return true
  }

  const syncedAt = Date.parse(media.metadataSyncedAt)

  if (Number.isNaN(syncedAt)) {
    return true
  }

  return Date.now() - syncedAt > CATALOG_REFRESH_MS
}

/**
 * Fetches movie or series details, including credits and ratings.
 *
 * A TMDB error is returned instead of thrown so a cached catalog row can still render.
 *
 * @param client - Configured TMDB client
 * @param mediaType - Which details endpoint to call
 * @param tmdbId - TMDB title id
 * @returns The parsed details, or the error that prevented the fetch
 */
async function loadTmdbTitle(
  client: ReturnType<typeof createTmdbClient>,
  mediaType: MediaType,
  tmdbId: number,
): Promise<LoadedTmdbTitle> {
  try {
    if (mediaType === 'movie') {
      return { details: { details: await client.getMovieTitleDetails(tmdbId), mediaType } }
    }

    return { details: { details: await client.getTvTitleDetails(tmdbId), mediaType } }
  } catch (error) {
    return { details: null, error }
  }
}

/**
 * Copies fresh TMDB catalog fields onto a stored row without writing them.
 *
 * The page can show current synopsis and runtime while a recent row skips upsert.
 *
 * @param media - Stored catalog row
 * @param input - Upsert payload built from the TMDB response
 * @returns The stored row with display fields replaced from `input`
 */
function overlayMedia(media: Media, input: TmdbUpsertMediaInput): Media {
  return {
    ...media,
    backdropPath: input.backdropPath ?? media.backdropPath,
    genres: input.genres
      ? input.genres.map((genre) => ({ name: genre.name, tmdbId: genre.tmdbId }))
      : media.genres,
    originalTitle: input.originalTitle ?? media.originalTitle,
    overview: input.overview ?? media.overview,
    posterPath: input.posterPath ?? media.posterPath,
    releaseDate: input.releaseDate ?? media.releaseDate,
    runtime: input.runtime ?? media.runtime,
    status: input.status ?? media.status,
    tagline: input.tagline ?? media.tagline,
    title: input.title || media.title,
    tvMeta: input.tvMeta
      ? {
          ...media.tvMeta,
          episodeCount: input.tvMeta.episodeCount ?? media.tvMeta?.episodeCount,
          inProduction: input.tvMeta.inProduction ?? media.tvMeta?.inProduction,
          nextEpisodeDate: input.tvMeta.nextEpisodeDate ?? media.tvMeta?.nextEpisodeDate,
          nextEpisodeNumber: input.tvMeta.nextEpisodeNumber ?? media.tvMeta?.nextEpisodeNumber,
          nextEpisodeSeason: input.tvMeta.nextEpisodeSeason ?? media.tvMeta?.nextEpisodeSeason,
          seasonCount: input.tvMeta.seasonCount ?? media.tvMeta?.seasonCount,
          seasonEpisodeCounts:
            input.tvMeta.seasonEpisodeCounts ?? media.tvMeta?.seasonEpisodeCounts,
        }
      : media.tvMeta,
    voteAverage: input.voteAverage ?? media.voteAverage,
  }
}

/**
 * Returns the catalog row for this title, upserting it when the cache is missing or stale.
 *
 * @param clerkUserId - Clerk user id forwarded to the upsert endpoint
 * @param cached - Existing catalog row, when one was found
 * @param loaded - TMDB details, or the error from that fetch
 * @returns The row to render, or `null` when there is nothing to show
 */
async function resolveCatalogMedia(
  clerkUserId: string,
  cached: Media | null,
  loaded: LoadedTmdbTitle,
): Promise<Media | null> {
  if (!loaded.details) {
    return cached
  }

  const upsertInput =
    loaded.details.mediaType === 'movie'
      ? mapMovieDetailsToUpsertInput(loaded.details.details)
      : mapTvDetailsToUpsertInput(loaded.details.details)

  if (cached && !isCatalogStale(cached)) {
    return overlayMedia(cached, upsertInput)
  }

  try {
    return await upsertMedia(clerkUserId, upsertInput)
  } catch (error) {
    if (!cached) {
      throw error
    }

    return overlayMedia(cached, upsertInput)
  }
}

/**
 * Writes the TMDB payload through the catalog upsert endpoint.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param input - Catalog fields mapped from TMDB
 * @returns The created or updated media document
 */
async function upsertMedia(clerkUserId: string, input: TmdbUpsertMediaInput): Promise<Media> {
  const result = await payloadFetch<{ doc: Media }>('/api/tmdb/upsert', {
    body: input,
    clerkUserId,
    method: 'POST',
  })

  return result.doc
}

/**
 * Ensures log-watch receives a library item whose media relation is the catalog document.
 *
 * @param libraryItem - Library row from Payload, which may only contain a media id
 * @param media - Catalog document for this page
 * @returns The same row with `media` populated
 */
function withMedia(libraryItem: LibraryItem, media: Media): LibraryItem {
  if (typeof libraryItem.media === 'object') {
    return libraryItem
  }

  return { ...libraryItem, media }
}
