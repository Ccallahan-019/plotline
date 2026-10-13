import type { PayloadRequest } from 'payload'

import { sql } from '@payloadcms/db-postgres'

import { getTransactionalDrizzle } from '@/utilities/getTransactionalDrizzle'

/**
 * Serializes membership writes that depend on a watchlist's whole membership set.
 *
 * Appending a membership (read the highest `sortOrder`, insert max + 1), reordering
 * (check the id list, then write `0..n-1`) and removing one all read the set before
 * they write. Without a shared lock, two of them in different transactions see the same
 * snapshot and either repeat a `sortOrder` or act on a membership that just went away.
 * This takes a transaction-scoped advisory lock keyed on the watchlist, held until the
 * surrounding transaction commits or rolls back, so the second writer waits and then
 * reads the committed rows. Outside a transaction the lock is released at once and
 * does nothing.
 *
 * @param req - Payload request, ideally inside an open transaction
 * @param watchlistId - Watchlist whose memberships are about to be read and written
 */
export async function lockWatchlistMemberships(
  req: PayloadRequest,
  watchlistId: number | string,
): Promise<void> {
  const db = await getTransactionalDrizzle(req)

  // The single-bigint form has its own key space, so it cannot collide with the
  // `(profileId, mediaId)` lock in withLibraryItemCreateLock.
  await db.execute(
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${`watchlist-memberships:${watchlistId}`}::text, 0))`,
  )
}
