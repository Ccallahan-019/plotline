import { describe, expect, it } from 'vitest'

import type { DashboardActivityRow } from '../types'

import {
  episodeTitleForNumber,
  episodeTitleLookup,
  watchedEpisodeLookup,
  watchedEpisodeTitle,
} from './episode-title'

describe('episodeTitleForNumber', () => {
  const episodes = [
    { episode_number: 1, name: '  Pilot  ' },
    { episode_number: 2, name: '   ' },
    { episode_number: 3, name: null },
  ]

  it('returns the trimmed title for the matching episode', () => {
    expect(episodeTitleForNumber(episodes, 1)).toBe('Pilot')
  })

  it('returns null when the name is blank, missing, or the episode is absent', () => {
    expect(episodeTitleForNumber(episodes, 2)).toBeNull()
    expect(episodeTitleForNumber(episodes, 3)).toBeNull()
    expect(episodeTitleForNumber(episodes, 4)).toBeNull()
  })
})

describe('watchedEpisodeTitle', () => {
  const episodes = [{ episode_number: 4, name: "Cat's in the Bag..." }]

  it('returns the title for a looked-up episode and null before the season loads', () => {
    const lookup = { episode: 4, season: 1, tmdbId: 1396 }

    expect(watchedEpisodeTitle(lookup, episodes)).toBe("Cat's in the Bag...")
    expect(watchedEpisodeTitle(lookup, undefined)).toBeNull()
    expect(watchedEpisodeTitle(null, episodes)).toBeNull()
  })
})

describe('episodeTitleLookup', () => {
  it('returns coordinates for a series episode', () => {
    expect(episodeTitleLookup({ episode: 3, mediaType: 'tv', season: 1, tmdbId: 1396 })).toEqual({
      episode: 3,
      season: 1,
      tmdbId: 1396,
    })
  })

  it('returns null when the episode is unknown', () => {
    expect(
      episodeTitleLookup({ episode: null, mediaType: 'tv', season: 1, tmdbId: 1396 }),
    ).toBeNull()
  })
})

describe('watchedEpisodeLookup', () => {
  it('returns coordinates for a TV episode with a TMDB id', () => {
    expect(
      watchedEpisodeLookup(row({ episode: 4, mediaType: 'tv', season: 2, tmdbId: 1396 })),
    ).toEqual({
      episode: 4,
      season: 2,
      tmdbId: 1396,
    })
  })

  it('returns null for films and TV rows that are not an episode', () => {
    expect(watchedEpisodeLookup(row({ mediaType: 'movie', tmdbId: 1 }))).toBeNull()
    expect(
      watchedEpisodeLookup(row({ episode: 1, mediaType: 'tv', season: null, tmdbId: 1 })),
    ).toBeNull()
    expect(
      watchedEpisodeLookup(row({ episode: 1, mediaType: 'tv', season: 1, tmdbId: null })),
    ).toBeNull()
  })
})

function row(overrides: Partial<DashboardActivityRow>): DashboardActivityRow {
  return {
    detail: null,
    episode: null,
    filterKind: 'watched',
    href: null,
    id: 'watch:1',
    label: 'Watched',
    mediaType: 'tv',
    occurredAt: '2026-10-01T12:00:00.000Z',
    posterPath: null,
    rating: null,
    season: null,
    title: 'The Show',
    tmdbId: null,
    ...overrides,
  }
}
