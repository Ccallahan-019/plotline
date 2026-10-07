import type { PayloadRequest } from 'payload'

/**
 * Reads the `:membershipId` param from a watchlist membership route.
 *
 * @param req - Payload request carrying `routeParams`
 * @returns A positive integer id, or `null` when the param is missing or not an integer
 */
export function readMembershipId(req: PayloadRequest): null | number {
  return readPositiveInt(req.routeParams?.membershipId)
}

/**
 * Reads the `:slug` param from a watchlist membership route.
 *
 * @param req - Payload request carrying `routeParams`
 * @returns The decoded slug, or `null` when it is missing or malformed
 */
export function readWatchlistSlug(req: PayloadRequest): null | string {
  const raw = req.routeParams?.slug

  if (typeof raw !== 'string') {
    return null
  }

  try {
    const slug = decodeURIComponent(raw).trim()

    if (!slug || slug.includes('/') || slug.includes('\\')) {
      return null
    }

    return slug
  } catch {
    return null
  }
}

// Positive integers only, so `0`, fractions, and non-numeric params fail closed.
function readPositiveInt(value: unknown): null | number {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }

  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}
