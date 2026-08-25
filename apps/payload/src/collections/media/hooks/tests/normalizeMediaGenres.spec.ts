import { describe, expect, it } from 'vitest'

import { normalizeMediaGenreRows } from '../normalizeMediaGenres'

describe('normalizeMediaGenreRows', () => {
  it('moves TMDB numeric ids onto tmdbId so Payload can generate array row ids', () => {
    expect(
      normalizeMediaGenreRows([
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
      ]),
    ).toEqual([
      { name: 'Action', tmdbId: 28 },
      { name: 'Adventure', tmdbId: 12 },
    ])
  })

  it('keeps Payload string row ids and existing tmdbId values on update', () => {
    expect(
      normalizeMediaGenreRows([
        { id: 'row_abc', name: 'Drama', tmdbId: 18 },
      ]),
    ).toEqual([{ id: 'row_abc', name: 'Drama', tmdbId: 18 }])
  })

  it('prefers tmdbId when both tmdbId and a numeric id are present', () => {
    expect(normalizeMediaGenreRows([{ id: 28, name: 'Action', tmdbId: 99 }])).toEqual([
      { name: 'Action', tmdbId: 99 },
    ])
  })
})
