import type { LibraryItem } from '@plotline/payload-types'

import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import type { LibraryItemsResponse } from '../../library-grid/types'

import { libraryGridQueryKeys } from '../../library-grid/services/query-keys'
import {
  applyLibraryItemUpdateToGridPage,
  applyOptimisticLibraryItemRemoval,
  applyOptimisticLibraryItemUpdate,
  patchLibraryItemFromUpdate,
  resolveLibraryItemUpdate,
} from './optimistic-library-item'

const NOW = '2026-10-06T22:00:00.000Z'

function gridPage(docs: LibraryItem[], totalDocs = docs.length): LibraryItemsResponse {
  return {
    docs,
    limit: 24,
    page: 1,
    totalDocs,
    totalPages: 1,
  }
}

// Minimal library item for optimistic patch assertions.
function libraryItem(
  overrides: Partial<LibraryItem> & Pick<LibraryItem, 'media' | 'progress' | 'status'>,
): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 10,
    profile: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('patchLibraryItemFromUpdate', () => {
  it('stamps startedAt when entering watching and completedAt when entering completed', () => {
    const planned = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: false },
      status: 'planned',
    })

    const watching = patchLibraryItemFromUpdate(planned, planned.id, { status: 'watching' }, NOW)

    expect(watching.status).toBe('watching')
    expect(watching.startedAt).toBe(NOW)
    expect(watching.completedAt).toBeUndefined()

    const completed = patchLibraryItemFromUpdate(
      watching,
      watching.id,
      { status: 'completed' },
      NOW,
    )

    expect(completed.startedAt).toBe(NOW)
    expect(completed.completedAt).toBe(NOW)
  })

  it('does not replace startedAt or completedAt that are already set', () => {
    const item = libraryItem({
      completedAt: '2026-03-01T00:00:00.000Z',
      media: 7,
      progress: { type: 'movie', watched: false },
      startedAt: '2026-02-01T00:00:00.000Z',
      status: 'on_hold',
    })

    const watching = patchLibraryItemFromUpdate(item, item.id, { status: 'watching' }, NOW)
    const completed = patchLibraryItemFromUpdate(item, item.id, { status: 'completed' }, NOW)

    expect(watching.startedAt).toBe('2026-02-01T00:00:00.000Z')
    expect(watching.completedAt).toBe('2026-03-01T00:00:00.000Z')
    expect(completed.startedAt).toBe('2026-02-01T00:00:00.000Z')
    expect(completed.completedAt).toBe('2026-03-01T00:00:00.000Z')
  })

  it('does not stamp startedAt when a planned movie jumps straight to completed', () => {
    const item = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: false },
      status: 'planned',
    })

    const patched = patchLibraryItemFromUpdate(item, item.id, { status: 'completed' }, NOW)

    expect(patched.startedAt).toBeUndefined()
    expect(patched.completedAt).toBe(NOW)
  })

  it('sets movie progress.watched when a movie newly becomes completed', () => {
    const item = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: false },
      rewatchCount: 0,
      status: 'watching',
    })

    const patched = patchLibraryItemFromUpdate(item, item.id, { status: 'completed' }, NOW)

    expect(patched.progress).toEqual({ type: 'movie', watched: true })
    expect(patched.rewatchCount).toBe(0)
    expect(item.progress).toEqual({ type: 'movie', watched: false })
  })

  it('leaves TV progress unchanged when a show newly becomes completed', () => {
    const item = libraryItem({
      media: 4,
      progress: { episodesWatched: 3, lastEpisode: 3, lastSeason: 1, type: 'tv' },
      status: 'watching',
    })

    const patched = patchLibraryItemFromUpdate(item, item.id, { status: 'completed' }, NOW)

    expect(patched.status).toBe('completed')
    expect(patched.completedAt).toBe(NOW)
    expect(patched.progress).toEqual({
      episodesWatched: 3,
      lastEpisode: 3,
      lastSeason: 1,
      type: 'tv',
    })
  })

  it('trims personal notes and stores a blank value as null', () => {
    const item = libraryItem({
      media: 7,
      personalNotes: 'old',
      progress: { type: 'movie', watched: false },
      status: 'planned',
    })

    expect(
      patchLibraryItemFromUpdate(item, item.id, { personalNotes: '  hello  ' }, NOW).personalNotes,
    ).toBe('hello')
    expect(
      patchLibraryItemFromUpdate(item, item.id, { personalNotes: '   ' }, NOW).personalNotes,
    ).toBeNull()
  })

  it('returns the same item when the id does not match or notes are already cleared', () => {
    const item = libraryItem({
      media: 7,
      personalNotes: null,
      progress: { type: 'movie', watched: false },
      status: 'planned',
    })

    expect(patchLibraryItemFromUpdate(item, 99, { status: 'watching' }, NOW)).toBe(item)
    expect(patchLibraryItemFromUpdate(item, item.id, { personalNotes: '  ' }, NOW)).toBe(item)
  })
})

describe('applyOptimisticLibraryItemUpdate', () => {
  it('drops a row from a status-filtered grid and patches the lookup list', () => {
    const queryClient = new QueryClient()
    const movie = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: false },
      status: 'watching',
    })
    const other = libraryItem({
      id: 11,
      media: 8,
      progress: { type: 'movie', watched: false },
      status: 'watching',
    })
    const gridKey = libraryGridQueryKeys.libraryItems({
      filters: { statuses: ['watching'] },
      page: 1,
    })

    queryClient.setQueryData(gridKey, gridPage([movie, other]))
    queryClient.setQueryData(libraryGridQueryKeys.libraryItemsLookup(), [movie, other])

    applyOptimisticLibraryItemUpdate(queryClient, movie.id, { status: 'completed' }, NOW)

    const grid = queryClient.getQueryData<LibraryItemsResponse>(gridKey)
    const lookup = queryClient.getQueryData<LibraryItem[]>(
      libraryGridQueryKeys.libraryItemsLookup(),
    )

    expect(grid?.docs.map((doc) => doc.id)).toEqual([other.id])
    expect(grid?.totalDocs).toBe(1)
    expect(lookup?.map((item) => item.id)).toEqual([movie.id, other.id])
    expect(lookup?.[0]).toMatchObject({
      completedAt: NOW,
      progress: { type: 'movie', watched: true },
      status: 'completed',
    })
    expect(movie.status).toBe('watching')
  })

  it('keeps the row when the grid filter includes the new status', () => {
    const queryClient = new QueryClient()
    const movie = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: false },
      status: 'watching',
    })
    const gridKey = libraryGridQueryKeys.libraryItems({
      filters: { statuses: ['completed', 'watching'] },
      page: 1,
    })

    queryClient.setQueryData(gridKey, gridPage([movie], 4))

    applyOptimisticLibraryItemUpdate(queryClient, movie.id, { status: 'completed' }, NOW)

    const grid = queryClient.getQueryData<LibraryItemsResponse>(gridKey)

    expect(grid?.docs.map((doc) => doc.id)).toEqual([movie.id])
    expect(grid?.docs[0]?.status).toBe('completed')
    expect(grid?.totalDocs).toBe(4)
  })

  it('patches an unfiltered grid in place', () => {
    const response = gridPage([
      libraryItem({
        media: 7,
        progress: { episodesWatched: 2, type: 'tv' },
        status: 'watching',
      }),
    ])

    const next = applyLibraryItemUpdateToGridPage(response, 10, { status: 'dropped' }, { now: NOW })

    expect(next.docs).toHaveLength(1)
    expect(next.docs[0]?.status).toBe('dropped')
    expect(next.docs[0]?.progress).toEqual({ episodesWatched: 2, type: 'tv' })
    expect(next.totalDocs).toBe(1)
    expect(next.docs[0]?.startedAt).toBeUndefined()
    expect(next.docs[0]?.completedAt).toBeUndefined()
  })
})

describe('applyOptimisticLibraryItemRemoval', () => {
  it('removes the item from the grid page that contains it and from the lookup list', () => {
    const queryClient = new QueryClient()
    const movie = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: true },
      status: 'completed',
    })
    const other = libraryItem({
      id: 11,
      media: 8,
      progress: { episodesWatched: 1, type: 'tv' },
      status: 'watching',
    })
    const pageOneKey = libraryGridQueryKeys.libraryItems({ page: 1 })
    const pageTwoKey = libraryGridQueryKeys.libraryItems({ page: 2 })

    queryClient.setQueryData(pageOneKey, gridPage([movie], 2))
    queryClient.setQueryData(pageTwoKey, gridPage([other], 2))
    queryClient.setQueryData(libraryGridQueryKeys.libraryItemsLookup(), [movie, other])

    applyOptimisticLibraryItemRemoval(queryClient, String(movie.id))

    const pageOne = queryClient.getQueryData<LibraryItemsResponse>(pageOneKey)
    const pageTwo = queryClient.getQueryData<LibraryItemsResponse>(pageTwoKey)
    const lookup = queryClient.getQueryData<LibraryItem[]>(
      libraryGridQueryKeys.libraryItemsLookup(),
    )

    expect(pageOne?.docs).toEqual([])
    expect(pageOne?.totalDocs).toBe(1)
    expect(pageTwo?.docs.map((doc) => doc.id)).toEqual([other.id])
    expect(lookup?.map((item) => item.id)).toEqual([other.id])
  })
})

describe('resolveLibraryItemUpdate', () => {
  it('returns null when the status is unchanged so another completed watch event is not created', () => {
    const item = libraryItem({
      media: 7,
      progress: { type: 'movie', watched: true },
      status: 'completed',
    })

    expect(resolveLibraryItemUpdate(item, { status: 'completed' })).toBeNull()
  })

  it('omits an unchanged status and keeps a notes edit', () => {
    const item = libraryItem({
      media: 7,
      personalNotes: 'old',
      progress: { type: 'movie', watched: true },
      status: 'completed',
    })

    expect(
      resolveLibraryItemUpdate(item, { personalNotes: '  later  ', status: 'completed' }),
    ).toEqual({
      personalNotes: 'later',
    })
  })

  it('treats blank notes as the same as null', () => {
    const item = libraryItem({
      media: 7,
      personalNotes: null,
      progress: { type: 'movie', watched: false },
      status: 'planned',
    })

    expect(resolveLibraryItemUpdate(item, { personalNotes: '   ' })).toBeNull()
  })

  it('still sends status and trimmed notes when the current item is not loaded', () => {
    expect(
      resolveLibraryItemUpdate(undefined, { personalNotes: '  x  ', status: 'watching' }),
    ).toEqual({
      personalNotes: 'x',
      status: 'watching',
    })
  })
})
