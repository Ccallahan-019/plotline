import type { TmdbTitleVideo } from '@plotline/shared/tmdb'

import { describe, expect, it } from 'vitest'

import { selectTitleTrailer } from '../select-title-trailer'

describe('selectTitleTrailer', () => {
  it('prefers an official trailer over an official teaser', () => {
    expect(
      selectTitleTrailer(
        [
          video({
            iso_3166_1: 'US',
            key: 'teaser',
            name: 'Official Teaser',
            published_at: '2025-01-01T00:00:00.000Z',
            type: 'Teaser',
          }),
          video({
            iso_3166_1: 'FR',
            key: 'trailer',
            name: 'Official Trailer',
            published_at: '2019-01-01T00:00:00.000Z',
            type: 'Trailer',
          }),
        ],
        'US',
      ),
    ).toEqual({ key: 'trailer', name: 'Official Trailer' })
  })

  it('prefers the profile region over a newer trailer from somewhere else', () => {
    expect(
      selectTitleTrailer(
        [
          video({
            iso_3166_1: 'US',
            key: 'us',
            name: 'US Trailer',
            published_at: '2025-01-01T00:00:00.000Z',
          }),
          video({
            iso_3166_1: 'GB',
            key: 'gb',
            name: 'UK Trailer',
            published_at: '2020-01-01T00:00:00.000Z',
          }),
        ],
        'gb',
      ),
    ).toEqual({ key: 'gb', name: 'UK Trailer' })
  })

  it('prefers the newest upload when type and region match', () => {
    expect(
      selectTitleTrailer(
        [
          video({ key: 'old', name: 'Old', published_at: '2020-01-01T00:00:00.000Z' }),
          video({ key: 'undated', name: 'Undated', published_at: null }),
          video({ key: 'new', name: 'New', published_at: '2024-06-01T00:00:00.000Z' }),
        ],
        'US',
      ),
    ).toEqual({ key: 'new', name: 'New' })
  })

  it('skips Vimeo and other video types', () => {
    expect(
      selectTitleTrailer(
        [
          video({ key: 'vimeo', name: 'Vimeo', site: 'Vimeo' }),
          video({ key: 'clip', name: 'Clip', type: 'Clip' }),
          video({ key: 'fan', name: 'Fan', official: false }),
          video({ key: 'yt', name: 'YouTube Trailer' }),
        ],
        'US',
      ),
    ).toEqual({ key: 'yt', name: 'YouTube Trailer' })

    expect(
      selectTitleTrailer(
        [video({ key: 'vimeo', site: 'Vimeo' }), video({ official: false })],
        'US',
      ),
    ).toBeNull()
  })

  it('accepts a YouTube site regardless of letter case', () => {
    expect(
      selectTitleTrailer([video({ key: 'lower', name: 'Lower', site: 'youtube' })], 'US'),
    ).toEqual({ key: 'lower', name: 'Lower' })

    expect(
      selectTitleTrailer([video({ key: 'upper', name: 'Upper', site: 'YOUTUBE' })], 'US'),
    ).toEqual({ key: 'upper', name: 'Upper' })
  })

  it('returns null for an empty list', () => {
    expect(selectTitleTrailer([], 'US')).toBeNull()
    expect(selectTitleTrailer(undefined, 'US')).toBeNull()
  })
})

function video(overrides: Partial<TmdbTitleVideo> = {}): TmdbTitleVideo {
  return {
    iso_3166_1: 'US',
    key: 'abc',
    name: 'Official Trailer',
    official: true,
    published_at: '2024-01-01T00:00:00.000Z',
    site: 'YouTube',
    type: 'Trailer',
    ...overrides,
  }
}
