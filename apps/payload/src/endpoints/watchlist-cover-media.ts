import type { PayloadRequest } from 'payload'

/**
 * True when this profile has a library row for the media id.
 *
 * Cover art has to be a title the owner already tracks. A missing row is the
 * same as an unknown id.
 *
 * @param req - Payload request, forwarded so the read stays on the current transaction
 * @param profileId - Profile that must own the library row
 * @param mediaId - Media id chosen as the watchlist cover
 * @returns Whether a library item links this profile to that media
 */
export async function libraryOwnsMedia(
  req: PayloadRequest,
  profileId: number,
  mediaId: number,
): Promise<boolean> {
  const result = await req.payload.find({
    collection: 'library-items',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [{ profile: { equals: profileId } }, { media: { equals: mediaId } }],
    },
  })

  return result.docs.length > 0
}

/**
 * Reads a media relationship that may be an id or a populated document.
 *
 * @param value - Stored `coverMedia` value
 * @returns The media id, or `null` when the cover is empty
 */
export function mediaRelationId(value: unknown): null | number {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = value.id

    if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
      return id
    }
  }

  return null
}
