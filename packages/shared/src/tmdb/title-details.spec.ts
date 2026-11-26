import { describe, expect, it } from 'vitest'

import { tmdbMovieTitleDetailsSchema, tmdbTvTitleDetailsSchema } from './schemas'

describe('tmdb title detail schemas', () => {
  it('keeps movie credits, certification, and vote count', () => {
    const details = tmdbMovieTitleDetailsSchema.parse({
      credits: {
        crew: [{ id: 1, job: 'Director', name: 'Wim Wenders', profile_path: '/w.jpg' }],
      },
      id: 976573,
      original_language: 'ja',
      release_dates: {
        results: [
          {
            iso_3166_1: 'US',
            release_dates: [{ certification: 'PG', type: 3 }],
          },
        ],
      },
      title: 'Perfect Days',
      vote_count: 1200,
    })

    expect(details.credits?.crew?.[0]).toMatchObject({
      id: 1,
      job: 'Director',
      name: 'Wim Wenders',
      profile_path: '/w.jpg',
    })
    expect(details.release_dates?.results[0]?.release_dates[0]?.certification).toBe('PG')
    expect(details.vote_count).toBe(1200)
  })

  it('keeps TV creators, networks, seasons, and content ratings', () => {
    const details = tmdbTvTitleDetailsSchema.parse({
      content_ratings: {
        results: [{ iso_3166_1: 'US', rating: 'TV-MA' }],
      },
      created_by: [{ name: 'Dan Erickson' }],
      id: 95396,
      name: 'Severance',
      networks: [{ name: 'Apple TV+' }],
      seasons: [
        {
          air_date: '2022-02-18',
          episode_count: 9,
          name: 'Season 1',
          poster_path: '/s1.jpg',
          season_number: 1,
        },
      ],
    })

    expect(details.created_by?.[0]?.name).toBe('Dan Erickson')
    expect(details.networks?.[0]?.name).toBe('Apple TV+')
    expect(details.seasons?.[0]?.name).toBe('Season 1')
    expect(details.seasons?.[0]?.air_date).toBe('2022-02-18')
    expect(details.content_ratings?.results[0]?.rating).toBe('TV-MA')
  })

  it('keeps a season overview', () => {
    const details = tmdbTvTitleDetailsSchema.parse({
      id: 95396,
      name: 'Severance',
      seasons: [
        { overview: ' The work is mysterious. ', season_number: 1 },
        { overview: null, season_number: 2 },
        { season_number: 3 },
      ],
    })

    expect(details.seasons?.[0]?.overview).toBe(' The work is mysterious. ')
    expect(details.seasons?.[1]?.overview).toBeNull()
    expect(details.seasons?.[2]?.overview).toBeUndefined()
  })

  it('keeps a videos array', () => {
    const video = {
      iso_3166_1: 'US',
      key: 'yt-key',
      name: 'Official Trailer',
      official: true,
      published_at: '2023-05-01T00:00:00.000Z',
      site: 'YouTube',
      type: 'Trailer',
    }

    const movie = tmdbMovieTitleDetailsSchema.parse({
      id: 1,
      title: 'Perfect Days',
      videos: { results: [video] },
    })
    const series = tmdbTvTitleDetailsSchema.parse({
      id: 2,
      name: 'Severance',
      videos: { results: [video] },
    })

    expect(movie.videos?.results).toEqual([video])
    expect(series.videos?.results).toEqual([video])
  })

  it('treats a missing or malformed videos block as no videos', () => {
    const movie = (videos: unknown) =>
      tmdbMovieTitleDetailsSchema.parse({
        credits: { cast: [{ id: 1, name: 'Koji Yakusho' }] },
        id: 1,
        title: 'Perfect Days',
        videos,
        vote_count: 4,
      })
    const series = tmdbTvTitleDetailsSchema.parse({
      id: 2,
      name: 'Severance',
      videos: null,
      vote_count: 9,
    })
    const withBadRow = movie({
      results: [{ key: 1 }, { key: 'ok', site: 'YouTube' }],
    })

    expect(movie({}).videos?.results).toEqual([])
    expect(movie({}).credits?.cast?.[0]?.name).toBe('Koji Yakusho')
    expect(movie({}).vote_count).toBe(4)
    expect(movie(null).videos?.results ?? []).toEqual([])
    expect(movie({ results: null }).videos?.results).toEqual([])
    expect(withBadRow.videos?.results).toEqual([{ key: 'ok', site: 'YouTube' }])
    expect(withBadRow.vote_count).toBe(4)
    expect(series.videos?.results ?? []).toEqual([])
    expect(series.vote_count).toBe(9)
  })

  it('keeps aggregate cast roles and crew jobs', () => {
    const details = tmdbTvTitleDetailsSchema.parse({
      aggregate_credits: {
        cast: [
          {
            id: 17419,
            name: 'Bryan Cranston',
            order: 0,
            roles: [{ character: 'Walter White' }],
          },
        ],
        crew: [
          {
            id: 66633,
            jobs: [{ job: 'Executive Producer' }],
            name: 'Vince Gilligan',
          },
        ],
      },
      id: 1396,
      name: 'Breaking Bad',
    })

    expect(details.aggregate_credits?.cast?.[0]?.roles?.[0]?.character).toBe('Walter White')
    expect(details.aggregate_credits?.crew?.[0]?.jobs?.[0]?.job).toBe('Executive Producer')
  })
})
