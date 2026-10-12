import type { PayloadRequest } from 'payload'

import { describe, expect, it } from 'vitest'

import { allocateWatchlistSlug, slugifyWatchlistName } from '../watchlist-slug'

describe('slugifyWatchlistName', () => {
  it('slugifies words and drops punctuation', () => {
    expect(slugifyWatchlistName('Friday Night!')).toBe('friday-night')
  })

  it('strips accents', () => {
    expect(slugifyWatchlistName('Crème Brûlée')).toBe('creme-brulee')
  })

  it('uses watchlist when the name has no letters or digits', () => {
    expect(slugifyWatchlistName('   ---  ')).toBe('watchlist')
  })

  it('reserves the create and edit route segments', () => {
    expect(slugifyWatchlistName('New')).toBe('new-list')
    expect(slugifyWatchlistName('Edit')).toBe('edit-list')
  })
})

describe('allocateWatchlistSlug', () => {
  it('appends a suffix when the owner already has that slug', async () => {
    const req = {
      payload: {
        find: async () => ({
          docs: [{ slug: 'friday-night' }, { slug: 'friday-night-2' }],
        }),
      },
    } as unknown as PayloadRequest

    await expect(allocateWatchlistSlug(req, 22, 'Friday Night')).resolves.toBe('friday-night-3')
  })
})
