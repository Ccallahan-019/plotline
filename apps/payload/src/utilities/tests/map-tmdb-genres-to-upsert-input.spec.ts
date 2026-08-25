import { mapMovieDetailsToUpsertInput, mapTmdbGenresToUpsertInput } from '@plotline/shared/tmdb'
import { describe, expect, it } from 'vitest'

describe('mapTmdbGenresToUpsertInput', () => {
  it('maps TMDB genre ids onto tmdbId instead of Payload array row id', () => {
    expect(
      mapTmdbGenresToUpsertInput([
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
      ]),
    ).toEqual([
      { name: 'Action', tmdbId: 28 },
      { name: 'Adventure', tmdbId: 12 },
    ])
  })
})

describe('mapMovieDetailsToUpsertInput', () => {
  it('does not pass TMDB genre ids as array row ids', () => {
    const input = mapMovieDetailsToUpsertInput({
      genres: [{ id: 18, name: 'Drama' }],
      id: 550,
      title: 'Fight Club',
    })

    expect(input.genres).toEqual([{ name: 'Drama', tmdbId: 18 }])
    expect(input.genres?.[0]).not.toHaveProperty('id')
  })
})
