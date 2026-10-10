import { describe, expect, it } from 'vitest'

import {
  classifyTitleSearchRow,
  shouldShowTitleSearchStatus,
} from '../classify-title-search-row'

describe('classifyTitleSearchRow', () => {
  describe('library', () => {
    it('lets a new title be added with a status', () => {
      expect(
        classifyTitleSearchRow({
          destination: 'library',
          inLibrary: false,
          onList: false,
        }),
      ).toEqual({
        disabled: false,
        reason: null,
        showStatus: true,
        state: 'new',
      })
    })

    it('blocks a title already in the library', () => {
      expect(
        classifyTitleSearchRow({
          destination: 'library',
          inLibrary: true,
          onList: false,
        }),
      ).toEqual({
        disabled: true,
        reason: 'Already in your library',
        showStatus: true,
        state: 'in-library',
      })
    })

    it('blocks a listed title as already in the library', () => {
      expect(
        classifyTitleSearchRow({
          destination: 'library',
          inLibrary: true,
          onList: true,
        }),
      ).toEqual({
        disabled: true,
        reason: 'Already in your library',
        showStatus: true,
        state: 'on-list',
      })
    })
  })

  describe('watchlist', () => {
    it('lets a new title be added with a status', () => {
      expect(
        classifyTitleSearchRow({
          destination: 'watchlist',
          inLibrary: false,
          onList: false,
        }),
      ).toEqual({
        disabled: false,
        reason: null,
        showStatus: true,
        state: 'new',
      })
    })

    it('lets a library title that is not on the list be added without status', () => {
      expect(
        classifyTitleSearchRow({
          destination: 'watchlist',
          inLibrary: true,
          onList: false,
        }),
      ).toEqual({
        disabled: false,
        reason: null,
        showStatus: false,
        state: 'in-library',
      })
    })

    it('blocks a title already on the list', () => {
      expect(
        classifyTitleSearchRow({
          destination: 'watchlist',
          inLibrary: true,
          onList: true,
        }),
      ).toEqual({
        disabled: true,
        reason: 'Already on this list',
        showStatus: false,
        state: 'on-list',
      })
    })
  })
})

describe('shouldShowTitleSearchStatus', () => {
  it('shows status on the library dialog before a title is selected', () => {
    expect(shouldShowTitleSearchStatus('library', null)).toBe(true)
  })

  it('hides status on the watchlist dialog before a title is selected', () => {
    expect(shouldShowTitleSearchStatus('watchlist', null)).toBe(false)
  })

  it('follows the selected row once a title is chosen', () => {
    const savedOnWatchlist = classifyTitleSearchRow({
      destination: 'watchlist',
      inLibrary: true,
      onList: false,
    })
    const newOnWatchlist = classifyTitleSearchRow({
      destination: 'watchlist',
      inLibrary: false,
      onList: false,
    })
    const savedInLibrary = classifyTitleSearchRow({
      destination: 'library',
      inLibrary: true,
      onList: false,
    })

    expect(shouldShowTitleSearchStatus('watchlist', savedOnWatchlist)).toBe(false)
    expect(shouldShowTitleSearchStatus('watchlist', newOnWatchlist)).toBe(true)
    expect(shouldShowTitleSearchStatus('library', savedInLibrary)).toBe(true)
  })
})
