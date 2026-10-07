import { WATCHLIST_NAME_MAX_LENGTH } from '@plotline/shared/constants'
import { describe, expect, it } from 'vitest'

import {
  editWatchlistFormSchema,
  toEditWatchlistFormValues,
  toUpdateWatchlistInput,
} from '../edit-watchlist-form'

describe('edit watchlist form', () => {
  it('fills an empty description when the watchlist has none', () => {
    expect(
      toEditWatchlistFormValues({
        description: null,
        name: 'Queue',
        visibility: 'private',
      }),
    ).toEqual({
      description: '',
      name: 'Queue',
      visibility: 'private',
    })
  })

  it('trims text and clears a blank description', () => {
    expect(
      toUpdateWatchlistInput({
        description: '   ',
        name: '  Queue  ',
        visibility: 'public',
      }),
    ).toEqual({
      description: null,
      name: 'Queue',
      visibility: 'public',
    })
  })

  it('keeps a trimmed description', () => {
    expect(
      toUpdateWatchlistInput({
        description: '  Friday night  ',
        name: 'Queue',
        visibility: 'friends',
      }),
    ).toEqual({
      description: 'Friday night',
      name: 'Queue',
      visibility: 'friends',
    })
  })

  it('rejects a blank name', () => {
    const result = editWatchlistFormSchema.safeParse({
      description: '',
      name: '   ',
      visibility: 'private',
    })

    expect(result.success).toBe(false)
  })

  it('rejects a name that is too long', () => {
    const result = editWatchlistFormSchema.safeParse({
      description: '',
      name: 'a'.repeat(WATCHLIST_NAME_MAX_LENGTH + 1),
      visibility: 'private',
    })

    expect(result.success).toBe(false)
  })
})
