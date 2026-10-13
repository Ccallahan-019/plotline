import type { LibraryItem, Media } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import type { MediaTitlePageData } from '../../types'

import { rememberTitleLibraryItem, titlePageWithLibraryItem } from '../remember-title-library-item'

function libraryItem(overrides: Partial<LibraryItem> = {}): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 42,
    media: 7,
    profile: 1,
    progress: { episodesWatched: 1, lastEpisode: 1, lastSeason: 1, type: 'tv' },
    status: 'watching',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function movie(overrides: Partial<Media> = {}): Media {
  return {
    createdAt: '2024-01-01T00:00:00.000Z',
    id: 7,
    mediaType: 'movie',
    title: 'Perfect Days',
    tmdbId: 976573,
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('rememberTitleLibraryItem', () => {
  it('keeps a populated media document from the logged row', () => {
    const catalog = movie()
    const loggedMedia = movie({ title: 'Logged copy' })

    const remembered = rememberTitleLibraryItem(libraryItem({ media: loggedMedia }), catalog)

    expect(remembered.id).toBe(42)
    expect(remembered.media).toBe(loggedMedia)
  })

  it('fills the catalog document when the logged row only has a media id', () => {
    const catalog = movie()

    const remembered = rememberTitleLibraryItem(libraryItem({ media: 7 }), catalog)

    expect(remembered.media).toBe(catalog)
    expect(remembered.status).toBe('watching')
    expect(remembered.progress).toEqual({
      episodesWatched: 1,
      lastEpisode: 1,
      lastSeason: 1,
      type: 'tv',
    })
  })
})

describe('titlePageWithLibraryItem', () => {
  it('replaces a missing library row with the logged item', () => {
    const catalog = movie()
    const logged = libraryItem({ id: 42, media: 7, status: 'watching' })
    const page = pageData(catalog)

    const next = titlePageWithLibraryItem(page, logged, catalog)

    expect(next?.libraryItem?.id).toBe(42)
    expect(next?.libraryItem?.status).toBe('watching')
    expect(next?.libraryItem?.media).toBe(catalog)
  })

  it('leaves a missing cache untouched', () => {
    expect(titlePageWithLibraryItem(undefined, libraryItem(), movie())).toBeUndefined()
  })
})

function pageData(media: Media): MediaTitlePageData {
  return {
    cast: [],
    certification: null,
    createdBy: [],
    crew: [],
    directors: [],
    keyCredits: [],
    language: null,
    libraryItem: null,
    media,
    networks: [],
    region: 'US',
    releaseStatusLabel: null,
    seasons: [],
    voteAverage: null,
    voteCount: null,
    watchEvents: [],
  }
}
