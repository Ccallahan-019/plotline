import { APIError, type CollectionBeforeValidateHook } from 'payload'

export const enforceUniqueTmdbMedia: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data?.tmdbId || !data.mediaType) {
    return data
  }

  const existing = await req.payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ tmdbId: { equals: data.tmdbId } }, { mediaType: { equals: data.mediaType } }],
    },
  })

  const duplicate = existing.docs[0]

  if (duplicate && (operation === 'create' || String(duplicate.id) !== String(originalDoc?.id))) {
    throw new APIError(
      `Media with tmdbId ${data.tmdbId} and mediaType ${data.mediaType} already exists`,
      400,
    )
  }

  return data
}
