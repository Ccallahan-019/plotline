import { tmdbTvSeasonDetailsSchema } from '@plotline/shared/tmdb'
import { describe, expect, it } from 'vitest'

describe('tmdbTvSeasonDetailsSchema', () => {
  it('parses a season when an episode name is null', () => {
    const season = tmdbTvSeasonDetailsSchema.parse({
      episodes: [
        {
          air_date: '2026-01-01',
          episode_number: 1,
          name: null,
          runtime: 42,
        },
      ],
      season_number: 1,
    })

    expect(season.episodes[0]?.name).toBeNull()
  })
})
