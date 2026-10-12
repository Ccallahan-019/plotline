import type { PayloadRequest } from 'payload'

const RESERVED_WATCHLIST_SLUGS = new Set(['edit', 'new'])

/**
 * Picks a slug that is unique for this owner.
 *
 * Starts from `slugifyWatchlistName`. When that slug is taken, appends `-2`,
 * `-3`, and so on. Returns null after 500 attempts so the caller can respond
 * with a conflict instead of looping.
 *
 * @param req - Payload request, forwarded so the read stays on the current transaction
 * @param profileId - Profile that will own the watchlist
 * @param name - Watchlist name to slugify
 * @returns A free slug, or `null` when every candidate is taken
 */
export async function allocateWatchlistSlug(
  req: PayloadRequest,
  profileId: number,
  name: string,
): Promise<null | string> {
  const base = slugifyWatchlistName(name)
  const existing = await req.payload.find({
    collection: 'watchlists',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      owner: { equals: profileId },
    },
  })
  const taken = new Set(existing.docs.map((doc) => doc.slug))

  if (!taken.has(base)) {
    return base
  }

  for (let suffix = 2; suffix <= 500; suffix += 1) {
    const candidate = `${base}-${suffix}`

    if (!taken.has(candidate)) {
      return candidate
    }
  }

  return null
}

/**
 * Builds a URL slug from a watchlist name.
 *
 * Letters and digits are kept, everything else becomes a hyphen, and the result
 * is lowercased. A blank name becomes `watchlist`. `new` and `edit` are reserved
 * so they cannot shadow the create and edit routes.
 *
 * @param name - Watchlist name, already trimmed by the caller when it came from the API
 * @returns A slug of at most 80 characters
 */
export function slugifyWatchlistName(name: string): string {
  const normalized = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')

  const base = normalized.length > 0 ? normalized : 'watchlist'

  if (RESERVED_WATCHLIST_SLUGS.has(base)) {
    return `${base}-list`
  }

  return base
}
