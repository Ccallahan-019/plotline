import type { Media } from '@plotline/payload-types'
import type { MediaReleaseStatus, MediaType } from '@plotline/shared/constants/media'
import type { PayloadRequest } from 'payload'

export type UpsertMediaFromTmdbInput = {
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

export async function upsertMediaFromTmdb(
  req: PayloadRequest,
  input: UpsertMediaFromTmdbInput,
): Promise<Media> {
  const existing = await req.payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ tmdbId: { equals: input.tmdbId } }, { mediaType: { equals: input.mediaType } }],
    },
  })

  const mediaData = {
    ...input,
    metadataSyncedAt: input.metadataSyncedAt ?? new Date().toISOString(),
  }

  if (existing.docs[0]) {
    return req.payload.update({
      collection: 'media',
      data: mediaData,
      id: existing.docs[0].id,
      overrideAccess: true,
      req,
    })
  }

  return req.payload.create({
    collection: 'media',
    data: mediaData,
    overrideAccess: true,
    req,
  })
}
