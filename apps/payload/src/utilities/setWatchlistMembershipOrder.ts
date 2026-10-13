import type { PayloadRequest } from 'payload'

import { sql } from '@payloadcms/db-postgres'

import { getTransactionalDrizzle } from '@/utilities/getTransactionalDrizzle'

/**
 * Writes `sortOrder = start + index` for each membership id in one statement.
 *
 * Order is not challenge progress, so this skips the collection hooks (ownership
 * checks, stats recalculation) that a `payload.update` per row would run. Only rows on
 * `watchlistId` match, and every id must match or the write throws, so the surrounding
 * transaction rolls back instead of leaving a half-numbered list. Call
 * {@link lockWatchlistMemberships} first when the id list was read in this request.
 *
 * @param req - Payload request with an open transaction
 * @param watchlistId - Watchlist the memberships belong to
 * @param membershipIds - Membership ids in the order they should be stored
 * @param start - `sortOrder` given to the first id. Defaults to 0
 * @throws When an id is not a membership of `watchlistId`
 */
export async function setWatchlistMembershipOrder(
  req: PayloadRequest,
  watchlistId: number | string,
  membershipIds: readonly number[],
  start = 0,
): Promise<void> {
  if (membershipIds.length === 0) {
    return
  }

  const db = await getTransactionalDrizzle(req)
  const tableName =
    req.payload.db.tableNameMap.get('watchlist_memberships') ?? 'watchlist_memberships'
  const table = req.payload.db.tables[tableName]

  if (!table) {
    throw new Error(`Missing table ${tableName}`)
  }

  const values = sql.join(
    membershipIds.map((id, index) => sql`(${id}::int4, ${start + index}::int4)`),
    sql`, `,
  )
  const result = await db.execute(sql`
    UPDATE ${sql.identifier(tableName)} AS m
    SET ${sql.identifier(table.sortOrder.name)} = v.sort_order,
        ${sql.identifier(table.updatedAt.name)} = now()
    FROM (VALUES ${values}) AS v(id, sort_order)
    WHERE m.${sql.identifier(table.id.name)} = v.id
      AND m.${sql.identifier(table.watchlist.name)} = ${watchlistId}
    RETURNING m.${sql.identifier(table.id.name)}
  `)

  if (result.rows.length !== membershipIds.length) {
    throw new Error('Not every membership belongs to the watchlist being reordered')
  }
}
