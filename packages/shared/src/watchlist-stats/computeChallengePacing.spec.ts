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

  it('does not treat an empty goal as finished or forecast a finish', () => {
    const base = {
      challenge: { dueDate: '2026-10-31', enabled: true, startDate: '2026-10-01' },
      completed: 0,
      goalIsEmpty: true,
      inProgress: 0,
      remaining: 0,
    }
    const open = computeChallengePacing({
      ...base,
      referenceDate: new Date('2026-10-11T10:00:00.000Z'),
    })
    const pastDue = computeChallengePacing({
      ...base,
      referenceDate: new Date('2026-11-02T10:00:00.000Z'),
    })

    expect(open.status).toBe('not_started')
    expect(pastDue.status).toBe('overdue')

    for (const pacing of [open, pastDue]) {
      expect(pacing.onTrack).toBeUndefined()
      expect(pacing.projectedFinishDate).toBeUndefined()
      expect(pacing.requiredPerDay).toBeUndefined()
    }
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
