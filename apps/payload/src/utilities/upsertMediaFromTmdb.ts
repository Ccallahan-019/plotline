import type { Media } from '@plotline/payload-types'
import type { TmdbUpsertMediaInput } from '@plotline/shared/tmdb'
import type { PayloadRequest } from 'payload'

export type UpsertMediaFromTmdbInput = TmdbUpsertMediaInput

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
