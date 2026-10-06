import { commitTransaction, initTransaction, killTransaction, type PayloadRequest } from 'payload'

export async function runInPayloadTransaction<T>(
  req: PayloadRequest,
  fn: () => Promise<T>,
): Promise<T> {
  const started = await initTransaction(req)

  try {
    const result = await fn()

    if (started) {
      await commitTransaction(req)
    }

    return result
  } catch (error) {
    if (started) {
      await killTransaction(req)
    }

    throw error
  }
}
