import type { PayloadRequest } from 'payload'

import { sql } from '@payloadcms/db-postgres'

import { getTransactionalDrizzle } from '@/utilities/getTransactionalDrizzle'

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
