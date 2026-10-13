import type { TmdbClient, TmdbSearchResponse } from '@plotline/shared/tmdb'

import { describe, expect, it, vi } from 'vitest'

import { browseTmdb } from '../browse'
import { parseSearchFilters } from '../search-filters'

const EMPTY_PAGE: TmdbSearchResponse = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
}

const KEYWORD_IDS = [1721, 9715]

function createClient() {
  return {
    discoverMovie: vi.fn().mockResolvedValue(EMPTY_PAGE),
    discoverTv: vi.fn().mockResolvedValue(EMPTY_PAGE),
    searchMovies: vi.fn().mockResolvedValue(EMPTY_PAGE),
    searchTv: vi.fn().mockResolvedValue(EMPTY_PAGE),
  }
}

describe('parseSearchFilters', () => {
  it('reads keyword ids and drops non-numeric values', () => {
    expect(parseSearchFilters(new URLSearchParams('keywordIds=1721,nope,9715'))).toEqual({
      genreIds: undefined,
      keywordIds: KEYWORD_IDS,
      providerIds: undefined,
      ratingMax: undefined,
      ratingMin: undefined,
      runtimeMax: undefined,
      runtimeMin: undefined,
      yearMax: undefined,
      yearMin: undefined,
    })
  })

  it('omits keyword ids when the param is missing or entirely invalid', () => {
    expect(parseSearchFilters(new URLSearchParams()).keywordIds).toBeUndefined()
    expect(
      parseSearchFilters(new URLSearchParams('keywordIds=nope,also')).keywordIds,
    ).toBeUndefined()
  })
})

describe('browseTmdb keywords', () => {
  it('passes comma-joined keyword ids to movie and TV discover', async () => {
    const client = createClient()

    await browseTmdb(
      client as unknown as TmdbClient,
      'discover',
      '',
      'movie',
      { keywordIds: KEYWORD_IDS },
      'popularity',
      1,
      'US',
    )
    await browseTmdb(
      client as unknown as TmdbClient,
      'discover',
      '',
      'tv',
      { keywordIds: KEYWORD_IDS },
      'popularity',
      1,
      'US',
    )

    const discoverParams = {
      sort_by: 'popularity.desc',
      with_keywords: '1721,9715',
    }

    expect(client.discoverMovie).toHaveBeenCalledWith(1, discoverParams)
    expect(client.discoverTv).toHaveBeenCalledWith(1, discoverParams)
  })

  it('does not send keywords in search mode', async () => {
    const client = createClient()

    await browseTmdb(
      client as unknown as TmdbClient,
      'search',
      'dune',
      'movie',
      { keywordIds: KEYWORD_IDS },
      'popularity',
      2,
      'US',
    )
    await browseTmdb(
      client as unknown as TmdbClient,
      'search',
      'dune',
      'tv',
      { keywordIds: KEYWORD_IDS },
      'popularity',
      2,
      'US',
    )

    expect(client.searchMovies).toHaveBeenCalledWith('dune', 2)
    expect(client.searchTv).toHaveBeenCalledWith('dune', 2)
    expect(client.discoverMovie).not.toHaveBeenCalled()
    expect(client.discoverTv).not.toHaveBeenCalled()
  })
})
