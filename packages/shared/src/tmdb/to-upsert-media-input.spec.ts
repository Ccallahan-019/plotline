import { describe, expect, it } from 'vitest'

import { tmdbTvDetailsSchema } from './schemas'
import { mapTvDetailsToUpsertInput } from './to-upsert-media-input'

describe('mapTvDetailsToUpsertInput', () => {
  it('maps seasons[].episode_count onto tvMeta.seasonEpisodeCounts, including season 0', () => {
    const details = tmdbTvDetailsSchema.parse({
      id: 1396,
      name: 'Breaking Bad',
      number_of_episodes: 62,
      number_of_seasons: 5,
      seasons: [
        {
          air_date: '2009-02-17',
          episode_count: 11,
          id: 3572,
          name: 'Specials',
          overview: '',
          poster_path: null,
          season_number: 0,
          vote_average: 0,
        },
        {
          episode_count: 7,
          name: 'Season 1',
          season_number: 1,
        },
        {
          episode_count: null,
          name: 'Season 2',
          season_number: 2,
        },
        {
          name: 'Season 3',
          season_number: 3,
        },
      ],
    })

    expect(mapTvDetailsToUpsertInput(details).tvMeta?.seasonEpisodeCounts).toEqual([
      { episodeCount: 11, season: 0 },
      { episodeCount: 7, season: 1 },
    ])
  })

  it('leaves seasonEpisodeCounts null when TMDB omits seasons', () => {
    const details = tmdbTvDetailsSchema.parse({
      id: 1,
      name: 'Unknown',
    })

    expect(mapTvDetailsToUpsertInput(details).tvMeta?.seasonEpisodeCounts).toBeNull()
  })
})
