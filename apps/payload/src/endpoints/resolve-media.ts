import type { Media } from '@plotline/payload-types'
import type { TmdbUpsertMediaInput } from '@plotline/shared/tmdb'
import type { PayloadRequest } from 'payload'

import { upsertMediaFromTmdb } from '../utilities/upsertMediaFromTmdb'
import { parseId } from './helpers'

/**
 * Catalog identity for a library write.
 *
 * Send either an existing `mediaId` or TMDB fields (`tmdbId`, `mediaType`, and
 * `title`). `releaseStatus` is the catalog release state; callers keep `status`
 * for the library item so the two do not collide.
 */
export type ResolveMediaBody = {
  mediaId?: number | string
  releaseStatus?: TmdbUpsertMediaInput['status']
} & Partial<Omit<TmdbUpsertMediaInput, 'metadataSyncedAt' | 'status'>>

/**
 * Loads a media row by id, or upserts one from TMDB fields.
 *
 * Both shapes are rejected together so a caller cannot attach a library row to
 * one document while refreshing another. A TMDB upsert stores `releaseStatus`
 * as the catalog `status`.
 *
 * @param req - Payload request the media read or upsert runs on
 * @param body - Existing media id or TMDB fields
 * @returns The media document, or a 400/404 response when identity is invalid
 */
export async function resolveMedia(
  req: PayloadRequest,
  body: ResolveMediaBody,
): Promise<Media | Response> {
  const mediaId = body.mediaId != null ? parseId(body.mediaId) : null

  if (body.mediaId != null && mediaId === null) {
    return Response.json({ error: 'mediaId must be a valid number' }, { status: 400 })
  }

  if (mediaId != null && body.tmdbId != null) {
    return Response.json(
      { error: 'Provide either mediaId or tmdbId with mediaType, not both' },
      { status: 400 },
    )
  }

  if (mediaId != null) {
    const media = await req.payload.findByID({
      collection: 'media',
      depth: 0,
      id: mediaId,
      overrideAccess: true,
    })

    if (!media) {
      return Response.json({ error: 'Media not found' }, { status: 404 })
    }

    return media
  }

  if (body.tmdbId == null || body.mediaType == null) {
    return Response.json(
      { error: 'mediaId or (tmdbId, mediaType, and title) are required' },
      { status: 400 },
    )
  }

  if (!body.title?.trim()) {
    return Response.json({ error: 'title is required when using tmdbId' }, { status: 400 })
  }

  return upsertMediaFromTmdb(req, toUpsertMediaInput(body))
}

/**
 * Maps a resolve-media body onto the TMDB upsert input.
 *
 * `releaseStatus` becomes catalog `status`. Library status and `mediaId` are
 * left off so they are not written onto the media row.
 *
 * @param body - Body that already has `tmdbId`, `mediaType`, and `title`
 * @returns Input for `upsertMediaFromTmdb`
 */
function toUpsertMediaInput(body: ResolveMediaBody): TmdbUpsertMediaInput {
  const { releaseStatus, ...rest } = body

  return {
    backdropPath: rest.backdropPath,
    externalIds: rest.externalIds,
    genres: rest.genres,
    mediaType: rest.mediaType!,
    originalTitle: rest.originalTitle,
    overview: rest.overview,
    popularity: rest.popularity,
    posterPath: rest.posterPath,
    releaseDate: rest.releaseDate,
    runtime: rest.runtime,
    status: releaseStatus,
    tagline: rest.tagline,
    title: rest.title!,
    tmdbId: rest.tmdbId!,
    tvMeta: rest.tvMeta,
    voteAverage: rest.voteAverage,
  }
}
