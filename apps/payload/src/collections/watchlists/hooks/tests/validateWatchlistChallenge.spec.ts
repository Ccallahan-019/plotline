import type { CollectionBeforeValidateHook } from 'payload'

import { APIError } from 'payload'
import { describe, expect, it } from 'vitest'

import { validateWatchlistChallenge } from '../validateWatchlistChallenge'

const validate = validateWatchlistChallenge as CollectionBeforeValidateHook

function run(data: unknown, originalDoc?: unknown) {
  return validate({
    data,
    originalDoc,
  } as Parameters<CollectionBeforeValidateHook>[0])
}

describe('validateWatchlistChallenge', () => {
  it('allows a list that is not a challenge without a goal', () => {
    const data = { challenge: { enabled: false }, name: 'Queue' }

    expect(run(data)).toBe(data)
  })

  it('requires a due date when challenge mode is enabled', () => {
    expect(() =>
      run({
        challenge: { enabled: true, goalCount: 10, goalType: 'count' },
      }),
    ).toThrow('Challenge dueDate is required when challenge mode is enabled')
  })

  it('requires a positive count goal when that goal type is selected', () => {
    expect(() =>
      run({
        challenge: {
          dueDate: '2026-12-31T00:00:00.000Z',
          enabled: true,
          goalType: 'count',
        },
      }),
    ).toThrow(APIError)

    expect(() =>
      run({
        challenge: {
          dueDate: '2026-12-31T00:00:00.000Z',
          enabled: true,
          goalCount: 0,
          goalType: 'count',
        },
      }),
    ).toThrow('Challenge goalCount must be greater than zero')
  })

  it('requires a positive runtime goal when that goal type is selected', () => {
    expect(() =>
      run({
        challenge: {
          dueDate: '2026-12-31T00:00:00.000Z',
          enabled: true,
          goalCount: 10,
          goalType: 'runtime_minutes',
        },
      }),
    ).toThrow('Challenge goalRuntimeMinutes must be greater than zero')
  })

  it('accepts a list size challenge with a due date and no goal number', () => {
    const withNullGoals = {
      challenge: {
        dueDate: '2026-12-31T00:00:00.000Z',
        enabled: true,
        goalCount: null,
        goalRuntimeMinutes: null,
        goalType: 'list_size',
      },
    }
    const withoutGoals = {
      challenge: {
        dueDate: '2026-12-31T00:00:00.000Z',
        enabled: true,
        goalType: 'list_size',
      },
    }

    expect(run(withNullGoals)).toBe(withNullGoals)
    expect(run(withoutGoals)).toBe(withoutGoals)
  })

  it('still requires a due date for a list size challenge', () => {
    expect(() =>
      run({
        challenge: {
          enabled: true,
          goalCount: null,
          goalRuntimeMinutes: null,
          goalType: 'list_size',
        },
      }),
    ).toThrow('Challenge dueDate is required when challenge mode is enabled')
  })

  it('accepts a positive goal for the selected type', () => {
    const data = {
      challenge: {
        dueDate: '2026-12-31T00:00:00.000Z',
        enabled: true,
        goalCount: 52,
        goalType: 'count',
      },
    }

    expect(run(data)).toBe(data)
  })

  it('clears a runtime goal submitted with a count challenge', () => {
    expect(
      run({
        challenge: {
          dueDate: '2026-12-31T00:00:00.000Z',
          enabled: true,
          goalCount: 52,
          goalRuntimeMinutes: 6000,
          goalType: 'count',
        },
      }),
    ).toEqual({
      challenge: {
        dueDate: '2026-12-31T00:00:00.000Z',
        enabled: true,
        goalCount: 52,
        goalRuntimeMinutes: null,
        goalType: 'count',
      },
    })
  })

  it('clears a count goal submitted with a runtime challenge', () => {
    expect(
      run({
        challenge: {
          dueDate: '2026-12-31T00:00:00.000Z',
          enabled: true,
          goalCount: 52,
          goalRuntimeMinutes: 6000,
          goalType: 'runtime_minutes',
        },
      }),
    ).toEqual({
      challenge: {
        dueDate: '2026-12-31T00:00:00.000Z',
        enabled: true,
        goalCount: null,
        goalRuntimeMinutes: 6000,
        goalType: 'runtime_minutes',
      },
    })
  })

  it('clears stored goal numbers when a partial update switches to list size', () => {
    expect(
      run(
        {
          challenge: {
            goalType: 'list_size',
          },
        },
        {
          challenge: {
            dueDate: '2026-12-31T00:00:00.000Z',
            enabled: true,
            goalCount: 52,
            goalRuntimeMinutes: 6000,
            goalType: 'count',
          },
        },
      ),
    ).toEqual({
      challenge: {
        goalCount: null,
        goalRuntimeMinutes: null,
        goalType: 'list_size',
      },
    })
  })

  it('keeps a stored goal when a later update does not send one', () => {
    const data = { name: 'Queue' }

    expect(
      run(data, {
        challenge: {
          dueDate: '2026-12-31T00:00:00.000Z',
          enabled: true,
          goalRuntimeMinutes: 6000,
          goalType: 'runtime_minutes',
        },
      }),
    ).toBe(data)
  })

  it('keeps stored goal numbers when a name-only update follows a list size challenge', () => {
    const data = { name: 'Queue' }

    expect(
      run(data, {
        challenge: {
          dueDate: '2026-12-31T00:00:00.000Z',
          enabled: true,
          goalCount: 52,
          goalRuntimeMinutes: 6000,
          goalType: 'list_size',
        },
      }),
    ).toBe(data)
  })
})
