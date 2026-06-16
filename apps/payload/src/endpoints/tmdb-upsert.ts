import type { MediaReleaseStatus, MediaType } from '@plotline/shared/constants/media'
import type { Endpoint, PayloadRequest } from 'payload'

import { parseJsonBody, requireServiceAuth } from './helpers'

type TmdbUpsertBody = {
  backdropPath?: null | string
  externalIds?: {
    imdbId?: null | string
    tvdbId?: null | number
  }
  genres?: Array<{ id: number; name: string }>
  mediaType: MediaType
  metadataSyncedAt?: null | string
  originalTitle?: null | string
  overview?: null | string
  popularity?: null | number
  posterPath?: null | string
  releaseDate?: null | string
  runtime?: null | number
  status?: MediaReleaseStatus | null
  tagline?: null | string
  title: string
  tmdbId: number
  tvMeta?: {
    episodeCount?: null | number
    inProduction?: boolean | null
    nextEpisodeDate?: null | string
    nextEpisodeNumber?: null | number
    nextEpisodeSeason?: null | number
    seasonCount?: null | number
  }
  voteAverage?: null | number
}

export const tmdbUpsertEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const body = await parseJsonBody<TmdbUpsertBody>(req)

    if (body instanceof Response) {
      return body
    }

    if (!body.tmdbId || !body.mediaType || !body.title) {
      return Response.json(
        { error: 'tmdbId, mediaType, and title are required' },
        { status: 400 },
      )
    }

    const existing = await req.payload.find({
      collection: 'media',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { tmdbId: { equals: body.tmdbId } },
          { mediaType: { equals: body.mediaType } },
        ],
      },
    })

    const mediaData = {
      ...body,
      metadataSyncedAt: body.metadataSyncedAt ?? new Date().toISOString(),
    }

    const doc = existing.docs[0]
      ? await req.payload.update({
          collection: 'media',
          data: mediaData,
          id: existing.docs[0].id,
          overrideAccess: true,
          req,
        })
      : await req.payload.create({
          collection: 'media',
          data: mediaData,
          overrideAccess: true,
          req,
        })

    return Response.json({ doc })
  },
  method: 'post',
  path: '/tmdb/upsert',
}
