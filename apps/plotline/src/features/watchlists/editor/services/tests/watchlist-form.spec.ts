import { WATCHLIST_NAME_MAX_LENGTH } from '@plotline/shared/constants'
import { describe, expect, it } from 'vitest'

import {
  createWatchlistFormValues,
  toWatchlistFormValues,
  toWatchlistWriteInput,
  watchlistFormSchema,
  type WatchlistFormValues,
} from '../watchlist-form'
import { parseWatchlistWriteBody } from '../watchlist-write'

function formValues(overrides: Partial<WatchlistFormValues> = {}): WatchlistFormValues {
  return {
    ...createWatchlistFormValues(false),
    name: 'Queue',
    ...overrides,
  }
}

describe('watchlist form', () => {
  it('fills an empty description when the watchlist has none', () => {
    expect(
      toWatchlistFormValues({
        description: null,
        name: 'Queue',
        visibility: 'private',
      }),
    ).toEqual({
      challengeEnabled: false,
      coverMediaId: null,
      description: '',
      dueDate: null,
      goalCount: null,
      goalHours: null,
      goalType: 'count',
      includeRewatches: false,
      name: 'Queue',
      priorCompletionRule: 'exclude_if_already_completed',
      startDate: null,
      tvCountRule: 'tv_as_series',
      visibility: 'private',
    })
  })

  it('keeps the challenge switch off for a system list', () => {
    expect(
      toWatchlistFormValues({
        challenge: {
          enabled: true,
          goalCount: 10,
          goalType: 'count',
        },
        description: null,
        isSystem: true,
        name: 'Watchlist',
        visibility: 'private',
      }).challengeEnabled,
    ).toBe(false)
  })

  it('keeps a list size goal when editing', () => {
    expect(
      toWatchlistFormValues({
        challenge: {
          enabled: true,
          goalCount: null,
          goalRuntimeMinutes: null,
          goalType: 'list_size',
        },
        description: null,
        name: 'Queue',
        visibility: 'private',
      }).goalType,
    ).toBe('list_size')
  })

  it('shows stored minutes as hours', () => {
    expect(
      toWatchlistFormValues({
        challenge: {
          enabled: true,
          goalRuntimeMinutes: 90,
          goalType: 'runtime_minutes',
        },
        description: '',
        name: 'Hours',
        visibility: 'public',
      }).goalHours,
    ).toBe(1.5)
  })

  it('trims text and clears a blank description when challenge mode is off', () => {
    expect(
      toWatchlistWriteInput(
        formValues({
          description: '   ',
          name: '  Queue  ',
          visibility: 'public',
        }),
      ),
    ).toEqual({
      challenge: { enabled: false },
      coverMedia: null,
      description: null,
      name: 'Queue',
      visibility: 'public',
    })
  })

  it('keeps a trimmed description', () => {
    expect(
      toWatchlistWriteInput(
        formValues({
          description: '  Friday night  ',
          visibility: 'friends',
        }),
      ),
    ).toMatchObject({
      description: 'Friday night',
      name: 'Queue',
      visibility: 'friends',
    })
  })

  it('does not submit challenge goals when the switch is off', () => {
    const input = toWatchlistWriteInput(
      formValues({
        dueDate: new Date(2026, 11, 31),
        goalCount: 52,
        goalHours: 10,
      }),
    )

    expect(input.challenge).toEqual({ enabled: false })
  })

  it('requires a due date and the count goal when challenge mode is on', () => {
    const missingDueDate = watchlistFormSchema.safeParse(
      formValues({
        challengeEnabled: true,
        goalCount: 52,
      }),
    )
    const missingGoal = watchlistFormSchema.safeParse(
      formValues({
        challengeEnabled: true,
        dueDate: new Date(2026, 11, 31),
      }),
    )

    expect(missingDueDate.success).toBe(false)
    expect(missingGoal.success).toBe(false)

    if (!missingDueDate.success) {
      expect(missingDueDate.error.issues.some((issue) => issue.path[0] === 'dueDate')).toBe(true)
    }

    if (!missingGoal.success) {
      expect(missingGoal.error.issues.some((issue) => issue.path[0] === 'goalCount')).toBe(true)
    }
  })

  it('requires the runtime goal and does not submit the inactive count', () => {
    const missingHours = watchlistFormSchema.safeParse(
      formValues({
        challengeEnabled: true,
        dueDate: new Date(2026, 11, 31),
        goalCount: 52,
        goalType: 'runtime_minutes',
      }),
    )

    expect(missingHours.success).toBe(false)

    const input = toWatchlistWriteInput(
      formValues({
        challengeEnabled: true,
        dueDate: new Date(2026, 11, 31),
        goalCount: 52,
        goalHours: 100,
        goalType: 'runtime_minutes',
        includeRewatches: true,
        startDate: new Date(2026, 0, 1),
        visibility: 'friends',
      }),
    )

    expect(input.challenge).toEqual({
      dueDate: '2026-12-31',
      enabled: true,
      goalCount: null,
      goalRuntimeMinutes: 6000,
      goalType: 'runtime_minutes',
      includeRewatches: true,
      priorCompletionRule: 'exclude_if_already_completed',
      startDate: '2026-01-01',
      tvCountRule: 'tv_as_series',
    })
    expect(parseWatchlistWriteBody(input).ok).toBe(true)
  })

  it('accepts a list size challenge without a goal number and submits both goals empty', () => {
    const values = formValues({
      challengeEnabled: true,
      dueDate: new Date(2026, 11, 31),
      goalCount: 52,
      goalHours: 10,
      goalType: 'list_size',
      includeRewatches: true,
    })

    expect(watchlistFormSchema.safeParse(values).success).toBe(true)

    const input = toWatchlistWriteInput(values)

    expect(input.challenge).toEqual({
      dueDate: '2026-12-31',
      enabled: true,
      goalCount: null,
      goalRuntimeMinutes: null,
      goalType: 'list_size',
      includeRewatches: true,
      priorCompletionRule: 'exclude_if_already_completed',
      startDate: null,
      tvCountRule: 'tv_as_series',
    })
    expect(parseWatchlistWriteBody(input).ok).toBe(true)
  })

  it('rejects a list size write that sets a goal number', () => {
    const result = parseWatchlistWriteBody({
      challenge: {
        dueDate: '2026-12-31',
        enabled: true,
        goalCount: 10,
        goalRuntimeMinutes: null,
        goalType: 'list_size',
        includeRewatches: false,
        priorCompletionRule: 'exclude_if_already_completed',
        startDate: null,
        tvCountRule: 'tv_as_series',
      },
      coverMedia: null,
      description: null,
      name: 'Queue',
      visibility: 'private',
    })

    expect(result).toEqual({ error: 'Only the active goal can be set', ok: false })
  })

  it('submits the count goal and leaves the runtime goal empty', () => {
    const input = toWatchlistWriteInput(
      formValues({
        challengeEnabled: true,
        coverMediaId: 12,
        dueDate: new Date(2026, 11, 31),
        goalCount: 52,
        goalHours: 10,
        goalType: 'count',
      }),
    )

    expect(input.coverMedia).toBe(12)
    expect(input.challenge).toMatchObject({
      enabled: true,
      goalCount: 52,
      goalRuntimeMinutes: null,
      goalType: 'count',
    })
    expect(parseWatchlistWriteBody(input).ok).toBe(true)
  })

  it('forces challenge mode off for a system list', () => {
    expect(
      toWatchlistWriteInput(
        formValues({
          challengeEnabled: true,
          dueDate: new Date(2026, 11, 31),
          goalCount: 10,
        }),
        { isSystem: true },
      ).challenge,
    ).toEqual({ enabled: false })
  })

  it('rejects a blank name', () => {
    const result = watchlistFormSchema.safeParse(formValues({ name: '   ' }))

    expect(result.success).toBe(false)
  })

  it('rejects a name that is too long', () => {
    const result = watchlistFormSchema.safeParse(
      formValues({ name: 'a'.repeat(WATCHLIST_NAME_MAX_LENGTH + 1) }),
    )

    expect(result.success).toBe(false)
  })

  it('rejects a start date after the due date', () => {
    const result = watchlistFormSchema.safeParse(
      formValues({
        challengeEnabled: true,
        dueDate: new Date(2026, 9, 1),
        goalCount: 10,
        startDate: new Date(2026, 11, 1),
      }),
    )

    expect(result.success).toBe(false)
  })

  it('accepts a start date on the due date', () => {
    const result = watchlistFormSchema.safeParse(
      formValues({
        challengeEnabled: true,
        dueDate: new Date(2026, 9, 1),
        goalCount: 10,
        startDate: new Date(2026, 9, 1),
      }),
    )

    expect(result.success).toBe(true)
  })
})
