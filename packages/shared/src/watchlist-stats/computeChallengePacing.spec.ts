import { describe, expect, it } from 'vitest'

import { computeChallengePacing } from './computeChallengePacing'

describe('computeChallengePacing', () => {
  it('computes a daily rate from Payload ISO start and due dates', () => {
    const pacing = computeChallengePacing({
      challenge: {
        dueDate: '2026-10-31T00:00:00.000Z',
        enabled: true,
        startDate: '2026-10-01T00:00:00.000Z',
      },
      completed: 10,
      inProgress: 0,
      referenceDate: new Date('2026-10-11T15:00:00.000Z'),
      remaining: 20,
    })

    expect(pacing).toMatchObject({
      actualPerDay: 1,
      daysElapsed: 10,
      daysRemaining: 20,
      requiredPerDay: 1,
      status: 'active',
    })
  })
  it('reports overdue after the due day even with no progress', () => {
    const pacing = computeChallengePacing({
      challenge: { dueDate: '2026-10-31', enabled: true, startDate: '2026-10-01' },
      completed: 0,
      inProgress: 0,
      referenceDate: new Date('2026-11-02T10:00:00.000Z'),
      remaining: 20,
    })

    expect(pacing.status).toBe('overdue')
  })

  it('keeps the due day itself open', () => {
    const pacing = computeChallengePacing({
      challenge: { dueDate: '2026-10-31', enabled: true, startDate: '2026-10-01' },
      completed: 5,
      inProgress: 0,
      referenceDate: new Date('2026-10-31T10:00:00.000Z'),
      remaining: 15,
    })

    expect(pacing.status).toBe('active')
  })
})
