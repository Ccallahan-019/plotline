import type { LibraryItem } from '@plotline/payload-types'

import { describe, expect, it } from 'vitest'

import { getDefaultLogWatchFormValues } from './log-watch-form'

function tvItem(progress: LibraryItem['progress']): LibraryItem {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 10,
    media: 4,
    profile: 1,
    progress,
    status: 'watching',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('getDefaultLogWatchFormValues', () => {
  it('copies an explicit episode onto both fields and skips the next-episode suggestion', () => {
    const requested = { episode: 4, season: 3 }
    const values = getDefaultLogWatchFormValues({
      episode: requested,
      libraryItem: tvItem({
        lastEpisode: 8,
        lastSeason: 1,
        seasonsCompleted: [1],
        type: 'tv',
      }),
    })

    requested.episode = 1
    requested.season = 1

    expect(values.episode).toEqual({ episode: 4, season: 3 })
    expect(values.episodes).toEqual([{ episode: 4, season: 3 }])
    expect(values.episodes[0]).not.toBe(values.episode)
    expect(values.platform).toBeUndefined()
    expect(values.platformOther).toBe('')
    expect(values.whenPreset).toBe('today')
  })

  it('suggests the next episode when no episode is passed', () => {
    const values = getDefaultLogWatchFormValues({
      libraryItem: tvItem({
        lastEpisode: 8,
        lastSeason: 1,
        seasonsCompleted: [1],
        type: 'tv',
      }),
    })

    expect(values.episode).toEqual({ episode: 1, season: 2 })
    expect(values.episodes).toEqual([{ episode: 1, season: 2 }])
  })
})
