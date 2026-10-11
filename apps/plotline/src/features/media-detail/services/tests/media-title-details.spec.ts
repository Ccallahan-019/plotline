import type { Media } from '@plotline/payload-types'

import { tmdbMovieTitleDetailsSchema, tmdbTvTitleDetailsSchema } from '@plotline/shared/tmdb'
import { describe, expect, it } from 'vitest'

import type { MediaTitlePageData } from '../../types'

import {
  buildMediaMetadataRows,
  formatMediaTitleMetaLine,
  formatWatchActivityLabel,
  formatWatchActivityPlatform,
  getTvWatchProgress,
} from '../format-media-title'
import { mapMovieTitleDetails, mapTvTitleDetails, seasonsFromMedia } from '../map-media-title-details'

describe('mapMovieTitleDetails', () => {
  it('prefers the viewer region and a theatrical certification', () => {
    const details = tmdbMovieTitleDetailsSchema.parse({
      credits: { crew: [{ id: 1, job: 'Director', name: 'Wim Wenders' }] },
      id: 1,
      original_language: 'ja',
      release_dates: {
        results: [
          {
            iso_3166_1: 'US',
            release_dates: [{ certification: 'PG', type: 3 }],
          },
          {
            iso_3166_1: 'DE',
            release_dates: [
              { certification: '6', type: 1 },
              { certification: '12', type: 3 },
            ],
          },
        ],
      },
      title: 'Perfect Days',
      vote_average: 7.8,
      vote_count: 20,
    })

    expect(mapMovieTitleDetails(details, 'de')).toMatchObject({
      certification: '12',
      directors: ['Wim Wenders'],
      language: 'Japanese',
      voteAverage: 7.8,
      voteCount: 20,
    })
  })

  it('groups crew onto one card per person and keeps the first 50', () => {
    const details = tmdbMovieTitleDetailsSchema.parse({
      credits: {
        crew: [
          { id: 1, job: 'Director', name: 'Ava DuVernay', profile_path: '/a.jpg' },
          ...Array.from({ length: 50 }, (_, index) => ({
            id: index + 2,
            job: 'Producer',
            name: `Producer ${index + 2}`,
          })),
          { id: 1, job: 'Writer', name: 'Ava DuVernay' },
          { id: 1, job: 'Director', name: 'Ava DuVernay' },
        ],
      },
      id: 1,
      title: 'Origin',
    })

    const crew = mapMovieTitleDetails(details, 'US').crew

    expect(crew).toHaveLength(50)
    expect(crew[0]).toEqual({
      id: 1,
      initials: 'AD',
      jobs: 'Director, Writer',
      name: 'Ava DuVernay',
      profilePath: '/a.jpg',
    })
    expect(crew.some((member) => member.id === 51)).toBe(false)
  })

  it('lists key film credits from the full crew, ignoring nearby job titles', () => {
    const details = tmdbMovieTitleDetailsSchema.parse({
      credits: {
        crew: [
          { id: 1, job: 'Director', name: 'David Fincher' },
          { id: 2, job: 'First Assistant Director', name: 'Mike Topoozian' },
          { id: 3, job: 'Screenplay', name: 'Jim Uhls' },
          { id: 3, job: 'Story', name: 'Jim Uhls' },
          { id: 4, job: 'Writer', name: 'Chuck Palahniuk' },
          { id: 5, job: 'Director of Photography', name: 'Jeff Cronenweth' },
          { id: 6, job: 'Editor', name: 'James Haygood' },
          { id: 7, job: 'Dialogue Editor', name: 'Ewa Sztompke' },
          ...Array.from({ length: 50 }, (_, index) => ({
            id: index + 20,
            job: 'Producer',
            name: `Producer ${index + 20}`,
          })),
          { id: 8, job: 'Director', name: 'Late Director' },
        ],
      },
      id: 550,
      title: 'Fight Club',
    })

    expect(mapMovieTitleDetails(details, 'US').keyCredits).toEqual([
      { label: 'Directors', names: ['David Fincher', 'Late Director'] },
      { label: 'Writers', names: ['Jim Uhls', 'Chuck Palahniuk'] },
      { label: 'Cinematography', names: ['Jeff Cronenweth'] },
      { label: 'Editors', names: ['James Haygood'] },
    ])
  })
})

describe('mapTvTitleDetails', () => {
  it('maps creators, network, certification, and seasons', () => {
    const details = tmdbTvTitleDetailsSchema.parse({
      content_ratings: {
        results: [
          { iso_3166_1: 'US', rating: 'TV-MA' },
          { iso_3166_1: 'GB', rating: '15' },
        ],
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
        { episode_count: 2, name: 'Specials', season_number: 0 },
      ],
      status: 'Returning Series',
    })

    const mapped = mapTvTitleDetails(details, 'GB')

    expect(mapped.certification).toBe('15')
    expect(mapped.createdBy).toEqual(['Dan Erickson'])
    expect(mapped.networks).toEqual(['Apple TV+'])
    expect(mapped.releaseStatusLabel).toBe('Returning Series')
    expect(mapped.seasons).toEqual([
      {
        airDate: null,
        episodeCount: 2,
        name: 'Specials',
        posterPath: null,
        seasonNumber: 0,
      },
      {
        airDate: '2022-02-18',
        episodeCount: 9,
        name: 'Season 1',
        posterPath: '/s1.jpg',
        seasonNumber: 1,
      },
    ])
  })

  it('builds seasons from stored lengths when TMDB details are missing', () => {
    expect(
      seasonsFromMedia(
        movie({
          mediaType: 'tv',
          tvMeta: { seasonEpisodeCounts: [{ episodeCount: 9, season: 1 }] },
        }),
      ),
    ).toEqual([
      {
        airDate: null,
        episodeCount: 9,
        name: 'Season 1',
        posterPath: null,
        seasonNumber: 1,
      },
    ])
  })

  it('maps cast initials', () => {
    const details = tmdbTvTitleDetailsSchema.parse({
      credits: {
        cast: [
          { character: 'Mark Scout', id: 1, name: 'Adam Scott' },
          { id: 2, name: 'Cher' },
        ],
      },
      id: 95396,
      name: 'Severance',
    })

    expect(mapTvTitleDetails(details, 'US').cast).toEqual([
      expect.objectContaining({ initials: 'AS', name: 'Adam Scott' }),
      expect.objectContaining({ initials: 'CH', name: 'Cher' }),
    ])
  })

  it('groups cast onto one card per person and keeps the first 50', () => {
    const details = tmdbTvTitleDetailsSchema.parse({
      credits: {
        cast: [
          { character: 'Mark Scout', id: 1, name: 'Adam Scott' },
          ...Array.from({ length: 50 }, (_, index) => ({
            character: 'Guest',
            id: index + 2,
            name: `Guest ${index + 2}`,
          })),
          { character: 'Mark Scout', id: 1, name: 'Adam Scott', profile_path: '/a.jpg' },
          { character: 'Helly R.', id: 1, name: 'Adam Scott' },
        ],
      },
      id: 95396,
      name: 'Severance',
    })

    const cast = mapTvTitleDetails(details, 'US').cast

    expect(cast).toHaveLength(50)
    expect(cast[0]).toEqual({
      character: 'Mark Scout, Helly R.',
      id: 1,
      initials: 'AS',
      name: 'Adam Scott',
      profilePath: '/a.jpg',
    })
    expect(cast.some((member) => member.id === 51)).toBe(false)
  })

  it('uses aggregate credits and joins a person’s roles and jobs', () => {
    const details = tmdbTvTitleDetailsSchema.parse({
      aggregate_credits: {
        cast: [
          {
            id: 1,
            name: 'Bryan Cranston',
            order: 0,
            profile_path: '/b.jpg',
            roles: [{ character: 'Walter White' }, { character: 'Walter White' }],
          },
          { id: 3, name: 'Later Billing', order: 2, roles: [{ character: 'Guest' }] },
          { id: 2, name: 'Aaron Paul', order: 1, roles: [{ character: 'Jesse Pinkman' }] },
        ],
        crew: [
          {
            id: 9,
            jobs: [{ job: 'Executive Producer' }, { job: 'Writer' }, { job: 'Writer' }],
            name: 'Vince Gilligan',
            profile_path: '/v.jpg',
          },
        ],
      },
      credits: {
        cast: [{ character: 'Ignored', id: 99, name: 'Ignored Person' }],
      },
      id: 1396,
      name: 'Breaking Bad',
    })

    const mapped = mapTvTitleDetails(details, 'US')

    expect(mapped.cast.map((member) => member.name)).toEqual([
      'Bryan Cranston',
      'Aaron Paul',
      'Later Billing',
    ])
    expect(mapped.cast[0]).toMatchObject({
      character: 'Walter White',
      profilePath: '/b.jpg',
    })
    expect(mapped.crew).toEqual([
      {
        id: 9,
        initials: 'VG',
        jobs: 'Executive Producer, Writer',
        name: 'Vince Gilligan',
        profilePath: '/v.jpg',
      },
    ])
  })

  it('lists creators, executive producers, and composers', () => {
    const details = tmdbTvTitleDetailsSchema.parse({
      aggregate_credits: {
        crew: [
          {
            id: 2,
            jobs: [{ job: 'Co-Executive Producer' }],
            name: 'Melissa Bernstein',
          },
          {
            id: 1,
            jobs: [{ job: 'Executive Producer' }, { job: 'Writer' }],
            name: 'Vince Gilligan',
          },
          {
            id: 3,
            jobs: [{ job: 'Music Supervisor' }],
            name: 'Thomas Golubić',
          },
          {
            id: 4,
            jobs: [{ job: 'Original Music Composer' }],
            name: 'Dave Porter',
          },
        ],
      },
      created_by: [{ id: 1, name: 'Vince Gilligan' }],
      id: 1396,
      name: 'Breaking Bad',
    })

    expect(mapTvTitleDetails(details, 'US').keyCredits).toEqual([
      { label: 'Creators', names: ['Vince Gilligan'] },
      { label: 'Executive producers', names: ['Vince Gilligan'] },
      { label: 'Music', names: ['Dave Porter'] },
    ])
  })
})

describe('formatMediaTitleMetaLine', () => {
  it('joins year, type, runtime, and certification for a film', () => {
    expect(
      formatMediaTitleMetaLine({
        certification: 'PG',
        media: movie({ releaseDate: '2023-12-21', runtime: 124 }),
      }),
    ).toBe('2023 · Film · 2h 4m · PG')
  })
})

describe('getTvWatchProgress', () => {
  it('reports episodes watched and the following episode while watching', () => {
    expect(
      getTvWatchProgress({
        episodeCount: 50,
        episodesWatched: 39,
        lastEpisode: 7,
        lastSeason: 2,
        status: 'watching',
      }),
    ).toEqual({
      episodeCount: 50,
      episodesWatched: 39,
      upNextEpisode: 8,
      upNextSeason: 2,
    })
  })

  it('advances up next to the following season after the current season is complete', () => {
    expect(
      getTvWatchProgress({
        episodeCount: 10,
        episodesWatched: 9,
        lastEpisode: 9,
        lastSeason: 1,
        media: movie({
          mediaType: 'tv',
          tvMeta: {
            seasonCount: 2,
            seasonEpisodeCounts: [
              { episodeCount: 9, season: 1 },
              { episodeCount: 1, season: 2 },
            ],
          },
        }),
        status: 'watching',
      }),
    ).toMatchObject({
      upNextEpisode: 1,
      upNextSeason: 2,
    })
  })

  it('hides progress when the title is not being watched', () => {
    expect(
      getTvWatchProgress({
        episodeCount: 10,
        episodesWatched: 10,
        lastEpisode: 10,
        lastSeason: 1,
        status: 'completed',
      }),
    ).toBeNull()
  })
})

describe('buildMediaMetadataRows', () => {
  it('uses the film field set', () => {
    const rows = buildMediaMetadataRows(
      pageData({
        directors: ['Wim Wenders'],
        language: 'Japanese',
        media: movie({
          genres: [{ name: 'Drama', tmdbId: 18 }],
          releaseDate: '2023-12-21',
          runtime: 124,
        }),
      }),
    )

    expect(rows.map((row) => row.label)).toEqual([
      'Director',
      'Genres',
      'Runtime',
      'Released',
      'Language',
    ])
    expect(rows.find((row) => row.label === 'Director')?.value).toBe('Wim Wenders')
    expect(rows.find((row) => row.label === 'Released')?.value).toBe('Dec 21, 2023')
  })

  it('uses the series field set', () => {
    const rows = buildMediaMetadataRows(
      pageData({
        createdBy: ['Dan Erickson'],
        media: movie({
          mediaType: 'tv',
          tvMeta: { episodeCount: 19, seasonCount: 2 },
        }),
        networks: ['Apple TV+'],
        releaseStatusLabel: 'Returning Series',
      }),
    )

    expect(rows.map((row) => [row.label, row.value])).toEqual([
      ['Created by', 'Dan Erickson'],
      ['Genres', '—'],
      ['Episodes', '19'],
      ['Network', 'Apple TV+'],
      ['Status', 'Returning Series'],
    ])
  })
})

describe('formatWatchActivityLabel', () => {
  it('includes the episode when the event has one', () => {
    expect(
      formatWatchActivityLabel({
        episode: 2,
        eventType: 'progress',
        id: 1,
        platform: null,
        platformOther: null,
        runtimeMinutes: null,
        season: 1,
        watchedAt: '2024-01-02T00:00:00.000Z',
      }),
    ).toBe('Progress · S1 E2')
  })
})

describe('formatWatchActivityPlatform', () => {
  it('uses the registry label for a known platform', () => {
    expect(
      formatWatchActivityPlatform({
        episode: null,
        eventType: 'completed',
        id: 1,
        platform: 'netflix',
        platformOther: null,
        runtimeMinutes: 124,
        season: null,
        watchedAt: '2024-01-02T00:00:00.000Z',
      }),
    ).toBe('Netflix')
  })

  it('uses the custom name when the platform is other', () => {
    expect(
      formatWatchActivityPlatform({
        episode: null,
        eventType: 'completed',
        id: 1,
        platform: 'other',
        platformOther: '  Plex  ',
        runtimeMinutes: null,
        season: null,
        watchedAt: '2024-01-02T00:00:00.000Z',
      }),
    ).toBe('Plex')
  })

  it('falls back to Other when the custom name is blank', () => {
    expect(
      formatWatchActivityPlatform({
        episode: null,
        eventType: 'completed',
        id: 1,
        platform: 'other',
        platformOther: '   ',
        runtimeMinutes: null,
        season: null,
        watchedAt: '2024-01-02T00:00:00.000Z',
      }),
    ).toBe('Other')
  })

  it('returns null when no platform was logged', () => {
    expect(
      formatWatchActivityPlatform({
        episode: null,
        eventType: 'completed',
        id: 1,
        platform: null,
        platformOther: null,
        runtimeMinutes: null,
        season: null,
        watchedAt: '2024-01-02T00:00:00.000Z',
      }),
    ).toBeNull()
  })
})

function movie(overrides: Partial<Media> = {}): Media {
  return {
    createdAt: '2024-01-01T00:00:00.000Z',
    id: 1,
    mediaType: 'movie',
    title: 'Perfect Days',
    tmdbId: 976573,
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function pageData(overrides: Partial<MediaTitlePageData> = {}): MediaTitlePageData {
  return {
    cast: [],
    certification: null,
    createdBy: [],
    crew: [],
    directors: [],
    keyCredits: [],
    language: null,
    libraryItem: null,
    media: movie(),
    memberships: [],
    networks: [],
    region: 'US',
    releaseStatusLabel: null,
    seasons: [],
    voteAverage: null,
    voteCount: null,
    watchEvents: [],
    ...overrides,
  }
}
