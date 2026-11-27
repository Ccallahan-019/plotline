import type { Media } from '@plotline/payload-types'

import { tmdbMovieTitleDetailsSchema } from '@plotline/shared/tmdb'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

import { getMediaTitlePage } from '../get-media-title'

const { getMovieTitleDetails } = vi.hoisted(() => ({
  getMovieTitleDetails: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()

  return {
    ...actual,
    cache: <Fn extends (...args: never[]) => unknown>(fn: Fn) => fn,
  }
})

vi.mock('@/lib/payload/payload-fetch', () => ({
  payloadFetch: vi.fn(),
}))

vi.mock('@plotline/shared/tmdb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@plotline/shared/tmdb')>()

  return {
    ...actual,
    createTmdbClient: () => ({
      getMovieTitleDetails,
    }),
  }
})

describe('getMediaTitlePage', () => {
  const originalToken = process.env.TMDB_READ_ACCESS_TOKEN

  beforeEach(() => {
    process.env.TMDB_READ_ACCESS_TOKEN = 'test-token'
    getMovieTitleDetails.mockReset()
    vi.mocked(payloadFetch).mockReset()
  })

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.TMDB_READ_ACCESS_TOKEN
    } else {
      process.env.TMDB_READ_ACCESS_TOKEN = originalToken
    }
  })

  it('renders the title when the parallel viewer-state read fails', async () => {
    const media = cachedMovie()

    getMovieTitleDetails.mockResolvedValue(
      tmdbMovieTitleDetailsSchema.parse({
        homepage: 'https://example.com/film',
        id: 550,
        title: 'Fight Club',
        vote_average: 8.4,
        vote_count: 120,
      }),
    )
    vi.mocked(payloadFetch).mockImplementation((path) => {
      if (path === '/api/media') {
        return Promise.resolve(paginated([media]))
      }

      if (path === '/api/profiles') {
        return Promise.resolve(paginated([{ preferences: { region: 'US' } }]))
      }

      if (path === '/api/library-items') {
        return Promise.reject(new Error('library unavailable'))
      }

      if (path === '/api/watch-events') {
        return Promise.resolve(paginated([]))
      }

      return Promise.reject(new Error(`Unexpected Payload path: ${path}`))
    })

    await expect(getMediaTitlePage('user_1', 'movie', 550)).resolves.toMatchObject({
      homepage: 'https://example.com/film',
      libraryItem: null,
      media: { id: 42, title: 'Fight Club' },
      voteCount: 120,
      watchEvents: [],
    })
  })

  it('renders the title when viewer state fails before a catalog row exists', async () => {
    const media = cachedMovie()

    getMovieTitleDetails.mockResolvedValue(
      tmdbMovieTitleDetailsSchema.parse({
        homepage: 'https://example.com/film',
        id: 550,
        title: 'Fight Club',
        vote_average: 8.4,
        vote_count: 120,
      }),
    )
    vi.mocked(payloadFetch).mockImplementation((path) => {
      if (path === '/api/media') {
        return Promise.resolve(paginated([]))
      }

      if (path === '/api/profiles') {
        return Promise.resolve(paginated([{ preferences: { region: 'US' } }]))
      }

      if (path === '/api/tmdb/upsert') {
        return Promise.resolve({ doc: { ...media, title: 'Fight Club' } })
      }

      if (path === '/api/library-items') {
        return Promise.reject(new Error('library unavailable'))
      }

      if (path === '/api/watch-events') {
        return Promise.resolve(paginated([]))
      }

      return Promise.reject(new Error(`Unexpected Payload path: ${path}`))
    })

    await expect(getMediaTitlePage('user_1', 'movie', 550)).resolves.toMatchObject({
      homepage: 'https://example.com/film',
      libraryItem: null,
      media: { id: 42, title: 'Fight Club' },
      voteCount: 120,
      watchEvents: [],
    })
  })
})

function cachedMovie(): Media {
  const syncedAt = new Date().toISOString()

  return {
    createdAt: syncedAt,
    id: 42,
    mediaType: 'movie',
    metadataSyncedAt: syncedAt,
    title: 'Cached title',
    tmdbId: 550,
    updatedAt: syncedAt,
    voteAverage: 7,
  }
}

function paginated<T>(docs: T[]): PayloadPaginatedDocs<T> {
  return {
    docs,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 1,
    nextPage: null,
    page: 1,
    pagingCounter: 1,
    prevPage: null,
    totalDocs: docs.length,
    totalPages: docs.length === 0 ? 0 : 1,
  }
}
