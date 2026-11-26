import { describe, expect, it } from 'vitest'

import { tmdbTvSeasonDetailsSchema } from './schemas'

describe('tmdbTvSeasonDetailsSchema', () => {
  it('keeps an episode still_path', () => {
    const season = tmdbTvSeasonDetailsSchema.parse({
      episodes: [
        {
          episode_number: 1,
          name: 'Pilot',
          still_path: '/still.jpg',
        },
        {
          episode_number: 2,
          name: 'Second',
          still_path: null,
        },
        {
          episode_number: 3,
          name: 'Third',
        },
      ],
      season_number: 1,
    })

    expect(season.episodes[0]?.still_path).toBe('/still.jpg')
    expect(season.episodes[1]?.still_path).toBeNull()
    expect(season.episodes[2]?.still_path).toBeUndefined()
  })

  it('keeps an episode overview', () => {
    const season = tmdbTvSeasonDetailsSchema.parse({
      episodes: [
        {
          episode_number: 1,
          name: 'Pilot',
          overview: ' A start. ',
        },
        {
          episode_number: 2,
          name: 'Second',
          overview: null,
        },
        {
          episode_number: 3,
          name: 'Third',
        },
      ],
      season_number: 1,
    })

    expect(season.episodes[0]?.overview).toBe(' A start. ')
    expect(season.episodes[1]?.overview).toBeNull()
    expect(season.episodes[2]?.overview).toBeUndefined()
  })
})
