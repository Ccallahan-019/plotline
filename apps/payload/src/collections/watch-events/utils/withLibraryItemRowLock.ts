import type { PayloadRequest } from 'payload'

import { sql } from '@payloadcms/db-postgres'

import { getTransactionalDrizzle } from '@/utilities/getTransactionalDrizzle'

/**
 * Serializes find-or-create of the library item for one profile/media pair.
 *
 * There is no row to lock before the item exists, so this takes a transaction-scoped
 * advisory lock on `(profileId, mediaId)`. A concurrent first log waits, then its find
 * sees the committed row instead of hitting the unique `(profile, media)` index.
 * Must run inside a transaction; the lock is released on commit or rollback.
 *
 * @param req - Payload request with an open transaction
 * @param profileId - Owning profile
 * @param mediaId - Media being added
 * @param fn - Find-or-create work to run while holding the lock
 * @returns Whatever `fn` returns
 */
export async function withLibraryItemCreateLock<T>(
  req: PayloadRequest,
  profileId: number,
  mediaId: number,
  fn: () => Promise<T>,
): Promise<T> {
  const db = await getTransactionalDrizzle(req)

  await db.execute(sql`SELECT pg_advisory_xact_lock(${profileId}::int4, ${mediaId}::int4)`)

  return fn()
}

export async function withLibraryItemRowLock<T>(
  req: PayloadRequest,
  libraryItemId: number | string,
  fn: () => Promise<T>,
): Promise<T> {
  const db = await getTransactionalDrizzle(req)
  const tableName = getLibraryItemsTableName(req)

  await db.execute(
    sql`SELECT id FROM ${sql.identifier(tableName)} WHERE id = ${libraryItemId} FOR UPDATE`,
  )

  return fn()
}

function getLibraryItemsTableName(req: PayloadRequest): string {
  return req.payload.db.tableNameMap.get('library_items') ?? 'library_items'
}
