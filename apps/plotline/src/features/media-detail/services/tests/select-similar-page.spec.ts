import type { TmdbSearchResponse } from '@plotline/shared/tmdb'

import { describe, expect, it, vi } from 'vitest'

import { selectSimilarPage, withSimilarMediaType } from '../select-similar-page'

function page(results: TmdbSearchResponse['results']): TmdbSearchResponse {
  return {
    page: 1,
    results,
    total_pages: 1,
    total_results: results.length,
  }
}

describe('selectSimilarPage', () => {
  it('keeps recommendations when that list has titles', async () => {
    const recommendations = page([{ id: 680, title: 'Pulp Fiction' }])
    const loadSimilar = vi.fn()

    await expect(selectSimilarPage(recommendations, loadSimilar)).resolves.toBe(recommendations)
    expect(loadSimilar).not.toHaveBeenCalled()
  })

  it('loads similar titles only when recommendations are empty', async () => {
    const similar = page([{ id: 13, name: 'Forrest Gump' }])
    const loadSimilar = vi.fn().mockResolvedValue(similar)

    await expect(selectSimilarPage(page([]), loadSimilar)).resolves.toBe(similar)
    expect(loadSimilar).toHaveBeenCalledOnce()
  })

  it('leaves a similar-endpoint failure for the caller', async () => {
    const loadSimilar = vi.fn().mockRejectedValue(new Error('upstream'))

    await expect(selectSimilarPage(page([]), loadSimilar)).rejects.toThrow('upstream')
  })
})

describe('withSimilarMediaType', () => {
  it('stamps the route media type onto every result', () => {
    const source = page([
      { id: 680, media_type: 'tv', title: 'Pulp Fiction' },
      { id: 1396, name: 'Breaking Bad' },
    ])

    const stamped = withSimilarMediaType(
      { ...source, total_pages: 4, total_results: 40 },
      'movie',
    )

    expect(stamped).toEqual({
      page: 1,
      results: [
        { id: 680, media_type: 'movie', title: 'Pulp Fiction' },
        { id: 1396, media_type: 'movie', name: 'Breaking Bad' },
      ],
      total_pages: 4,
      total_results: 40,
    })
    expect(source.results[0]?.media_type).toBe('tv')
    expect(source.results[1]?.media_type).toBeUndefined()
  })

  it('keeps an empty page empty', () => {
    expect(withSimilarMediaType(page([]), 'tv')).toEqual(page([]))
  })
})
