import type { Watchlist } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

/**
 * Loads a watchlist when the slug belongs to the resolved profile.
 *
 * Slugs are unique per owner, so the owner filter is required. Missing and
 * unowned lists are both `null` so callers can respond with not found.
 *
 * @param req - Payload request, forwarded so the read stays on the current transaction
 * @param profileId - Profile that must own the watchlist
 * @param slug - Watchlist slug
 * @returns The watchlist, or `null` when this profile does not have that slug
 */
export async function findOwnedWatchlistBySlug(
  req: PayloadRequest,
  profileId: number,
  slug: string,
): Promise<null | Watchlist> {
  const result = await req.payload.find({
    collection: 'watchlists',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [{ owner: { equals: profileId } }, { slug: { equals: slug } }],
    },
  })

  return result.docs[0] ?? null
}
