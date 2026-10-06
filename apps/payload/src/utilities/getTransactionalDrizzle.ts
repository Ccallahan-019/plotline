import type { PayloadRequest } from 'payload'

export async function getTransactionalDrizzle(
  req: PayloadRequest,
): Promise<typeof req.payload.db.drizzle> {
  const transactionID = await req.transactionID

  if (transactionID != null) {
    const session = req.payload.db.sessions?.[String(transactionID)]

    if (session?.db) {
      return session.db as typeof req.payload.db.drizzle
    }
  }

  return req.payload.db.drizzle
}
