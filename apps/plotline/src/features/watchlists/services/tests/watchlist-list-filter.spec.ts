import { describe, expect, it } from 'vitest'

import { toWatchlistFilterSearchParams } from '../watchlist-list-filter'

describe('toWatchlistFilterSearchParams', () => {
  it('selects enabled challenges', () => {
    expect(toWatchlistFilterSearchParams('challenge')).toEqual({
      'where[challenge.enabled][equals]': 'true',
    })
  })

  it('keeps lists whose challenge mode is off or unset', () => {
    expect(toWatchlistFilterSearchParams('list')).toEqual({
      'where[or][0][challenge.enabled][equals]': 'false',
      'where[or][1][challenge.enabled][exists]': 'false',
    })
  })

  it('keeps the system and custom filters and returns every list when omitted', () => {
    expect(toWatchlistFilterSearchParams('system')).toEqual({
      'where[isSystem][equals]': 'true',
    })
    expect(toWatchlistFilterSearchParams('custom')).toEqual({
      'where[isSystem][equals]': 'false',
    })
    expect(toWatchlistFilterSearchParams(undefined)).toEqual({})
    expect(toWatchlistFilterSearchParams(null)).toEqual({})
  })
})
