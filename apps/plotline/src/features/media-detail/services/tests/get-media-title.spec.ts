import type { Media } from '@plotline/payload-types'

import { tmdbMovieTitleDetailsSchema } from '@plotline/shared/tmdb'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

import { getMediaTitlePage } from '../get-media-title'

const { getMovieTitleDetails, getTitleVideos } = vi.hoisted(() => ({
  getMovieTitleDetails: vi.fn(),
  getTitleVideos: vi.fn(),
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
      getTitleVideos,
    }),
  }
})

describe('getMediaTitlePage', () => {
  const originalToken = process.env.TMDB_READ_ACCESS_TOKEN

  beforeEach(() => {
    process.env.TMDB_READ_ACCESS_TOKEN = 'test-token'
    getMovieTitleDetails.mockReset()
    getTitleVideos.mockReset()
    vi.mocked(payloadFetch).mockReset()
  })

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.TMDB_READ_ACCESS_TOKEN
    } else {
      process.env.TMDB_READ_ACCESS_TOKEN = originalToken
    }
  })

  it('fails the page when the parallel viewer-state read fails', async () => {
    const media = cachedMovie()

    getMovieTitleDetails.mockResolvedValue(movieDetails())
    mockPayload({ catalog: [media], libraryItems: () => Promise.reject(new Error('library down')) })

    await expect(getMediaTitlePage('user_1', 'movie', 550)).rejects.toThrow('library down')
  })

  it('fails the page when viewer state fails before a catalog row exists', async () => {
    const media = cachedMovie()

    getMovieTitleDetails.mockResolvedValue(movieDetails())
    mockPayload({
      catalog: [],
      libraryItems: () => Promise.reject(new Error('library down')),
      upserted: { ...media, title: 'Fight Club' },
    })

    await expect(getMediaTitlePage('user_1', 'movie', 550)).rejects.toThrow('library down')
  })

  it('starts the details request without waiting for the profile region', async () => {
    const media = cachedMovie()
    let resolveRegion: (value: unknown) => void = () => undefined
    const regionPending = new Promise((resolve) => {
      resolveRegion = resolve
    })

    getMovieTitleDetails.mockResolvedValue(movieDetails())
    mockPayload({ catalog: [media], profiles: () => regionPending })

    const page = getMediaTitlePage('user_1', 'movie', 550)

    await vi.waitFor(() => expect(getMovieTitleDetails).toHaveBeenCalledWith(550))
    expect(getTitleVideos).not.toHaveBeenCalled()

    resolveRegion(paginated([{ preferences: { region: 'FR' } }]))
    await page

    expect(getTitleVideos).toHaveBeenCalledWith('movie', 550, ['fr'])
  })

  it('uses the region-language videos in place of the details videos', async () => {
    const media = cachedMovie()

    getMovieTitleDetails.mockResolvedValue(movieDetails())
    getTitleVideos.mockResolvedValue({
      results: [
        {
          iso_3166_1: 'FR',
          key: 'fr-trailer',
          name: 'Bande-annonce',
          official: true,
          site: 'YouTube',
          type: 'Trailer',
        },
      ],
    })
    mockPayload({ catalog: [media], region: 'FR' })

    await expect(getMediaTitlePage('user_1', 'movie', 550)).resolves.toMatchObject({
      trailer: { key: 'fr-trailer', name: 'Bande-annonce' },
    })
  })

  it.each([
    ['fails', () => getTitleVideos.mockRejectedValue(new Error('videos unavailable'))],
    ['returns no videos', () => getTitleVideos.mockResolvedValue({ results: [] })],
  ])('keeps the details videos when the region-language request %s', async (_case, arrange) => {
    const media = cachedMovie()

    getMovieTitleDetails.mockResolvedValue(
      movieDetails({
        videos: {
          results: [
            {
              iso_3166_1: 'US',
              key: 'en-trailer',
              name: 'Trailer',
              official: true,
              site: 'YouTube',
              type: 'Trailer',
            },
          ],
        },
      }),
    )
    arrange()
    mockPayload({ catalog: [media], region: 'FR' })

    await expect(getMediaTitlePage('user_1', 'movie', 550)).resolves.toMatchObject({
      trailer: { key: 'en-trailer' },
    })
  })
})

type MockPayloadOptions = {
  catalog: Media[]
  libraryItems?: () => Promise<unknown>
  profiles?: () => Promise<unknown>
  region?: string
  upserted?: Media
}

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

// Routes the Payload paths the title page reads. Library items resolve to none unless overridden.
function mockPayload({
  catalog,
  libraryItems = () => Promise.resolve(paginated([])),
  profiles,
  region = 'US',
  upserted,
}: MockPayloadOptions) {
  vi.mocked(payloadFetch).mockImplementation((path) => {
    if (path === '/api/media') {
      return Promise.resolve(paginated(catalog))
    }

    if (path === '/api/profiles') {
      return profiles?.() ?? Promise.resolve(paginated([{ preferences: { region } }]))
    }

    if (path === '/api/tmdb/upsert') {
      return Promise.resolve({ doc: upserted })
    }

    if (path === '/api/library-items') {
      return libraryItems()
    }

    if (path === '/api/watch-events') {
      return Promise.resolve(paginated([]))
    }

    return Promise.reject(new Error(`Unexpected Payload path: ${path}`))
  })
}

function movieDetails(overrides: Record<string, unknown> = {}) {
  return tmdbMovieTitleDetailsSchema.parse({
    homepage: 'https://example.com/film',
    id: 550,
    title: 'Fight Club',
    vote_average: 8.4,
    vote_count: 120,
    ...overrides,
  })
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
