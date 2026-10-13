import { commitTransaction, initTransaction, killTransaction, type PayloadRequest } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { runInPayloadTransaction } from '../runInPayloadTransaction'

vi.mock('payload', () => ({
  commitTransaction: vi.fn(),
  initTransaction: vi.fn(),
  killTransaction: vi.fn(),
}))

const req = { payload: {} } as PayloadRequest

describe('runInPayloadTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('commits a transaction it started when the callback succeeds', async () => {
    vi.mocked(initTransaction).mockResolvedValue(true)
    vi.mocked(commitTransaction).mockResolvedValue(undefined)

    await expect(runInPayloadTransaction(req, async () => 'ok')).resolves.toBe('ok')

    expect(commitTransaction).toHaveBeenCalledWith(req)
    expect(killTransaction).not.toHaveBeenCalled()
  })

  it('rolls back a transaction it started when the callback throws after a write', async () => {
    vi.mocked(initTransaction).mockResolvedValue(true)
    vi.mocked(killTransaction).mockResolvedValue(undefined)

    const writes: string[] = []

    await expect(
      runInPayloadTransaction(req, async () => {
        writes.push('watch-event')
        throw new Error('simulated failure after watch-event create')
      }),
    ).rejects.toThrow('simulated failure after watch-event create')

    expect(writes).toEqual(['watch-event'])
    expect(killTransaction).toHaveBeenCalledWith(req)
    expect(commitTransaction).not.toHaveBeenCalled()
  })

  it('does not commit or roll back a transaction it did not start', async () => {
    vi.mocked(initTransaction).mockResolvedValue(false)

    await expect(
      runInPayloadTransaction(req, async () => {
        throw new Error('fail')
      }),
    ).rejects.toThrow('fail')

    expect(commitTransaction).not.toHaveBeenCalled()
    expect(killTransaction).not.toHaveBeenCalled()
  })
})
