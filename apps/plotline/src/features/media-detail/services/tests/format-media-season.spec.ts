import { describe, expect, it } from 'vitest'

import type { MediaTitleSeason } from '../../types'

import {
  countSeasonEpisodesWatched,
  formatEpisodeDisplayName,
  formatEpisodeMeta,
  formatEpisodeRuntime,
  formatSeasonEpisodeCount,
  formatSeasonWatchedLabel,
  resolveSelectedSeason,
} from '../format-media-season'
import { formatReleaseDateLabel } from '../format-media-title'

const season = (seasonNumber: number, name = `Season ${seasonNumber}`): MediaTitleSeason => ({
  airDate: null,
  episodeCount: 9,
  name,
  posterPath: null,
  seasonNumber,
})

describe('countSeasonEpisodesWatched', () => {
  it('counts distinct episodes in one season and ignores other seasons', () => {
    expect(
      countSeasonEpisodesWatched(
        [
          { episode: 1, season: 1 },
          { episode: 1, season: 1 },
          { episode: 2, season: 1 },
          { episode: 0, season: 1 },
          { episode: 1, season: 2 },
        ],
        1,
        9,
      ),
    ).toBe(2)
  })

  it('caps the count at the season length', () => {
    expect(
      countSeasonEpisodesWatched(
        [
          { episode: 1, season: 1 },
          { episode: 2, season: 1 },
          { episode: 3, season: 1 },
        ],
        1,
        2,
      ),
    ).toBe(2)
  })
})

describe('formatEpisodeRuntime', () => {
  it('uses minutes under an hour and hours after that', () => {
    expect(formatEpisodeRuntime(null)).toBeNull()
    expect(formatEpisodeRuntime(0)).toBeNull()
    expect(formatEpisodeRuntime(48)).toBe('48m')
    expect(formatEpisodeRuntime(60)).toBe('1h')
    expect(formatEpisodeRuntime(62)).toBe('1h 2m')
  })
})

describe('formatEpisodeMeta', () => {
  it('joins the air date and runtime', () => {
    expect(formatEpisodeMeta('2022-02-18', 48)).toBe(
      `${formatReleaseDateLabel('2022-02-18')} · 48m`,
    )
    expect(formatEpisodeMeta(null, 48)).toBe('48m')
    expect(formatEpisodeMeta(null, null)).toBeNull()
  })
})

describe('formatEpisodeDisplayName', () => {
  it('falls back when TMDB omits the name', () => {
    expect(formatEpisodeDisplayName('  Pilot  ', 1)).toBe('Pilot')
    expect(formatEpisodeDisplayName('  ', 3)).toBe('Episode 3')
  })
})

describe('formatSeasonEpisodeCount', () => {
  it('pluralizes the episode count', () => {
    expect(formatSeasonEpisodeCount(null)).toBeNull()
    expect(formatSeasonEpisodeCount(1)).toBe('1 episode')
    expect(formatSeasonEpisodeCount(9)).toBe('9 episodes')
  })
})

describe('formatSeasonWatchedLabel', () => {
  it('labels watched episodes over the season length', () => {
    expect(formatSeasonWatchedLabel(3, 9)).toBe('3 / 9 Watched')
  })
})

describe('resolveSelectedSeason', () => {
  const seasons = [season(0, 'Specials'), season(1), season(2)]

  it('keeps the user selection when that season is still listed', () => {
    expect(resolveSelectedSeason(seasons, 2, 1)?.seasonNumber).toBe(2)
    expect(resolveSelectedSeason(seasons, 0, 1)?.seasonNumber).toBe(0)
  })

  it('uses the last watched season before the default season', () => {
    expect(resolveSelectedSeason(seasons, null, 1)?.seasonNumber).toBe(1)
    expect(resolveSelectedSeason(seasons, 9, 1)?.seasonNumber).toBe(1)
    expect(resolveSelectedSeason(seasons, null, 2)?.seasonNumber).toBe(2)
  })

  it('falls back to the lowest regular season', () => {
    expect(resolveSelectedSeason(seasons, null, null)?.seasonNumber).toBe(1)
    expect(resolveSelectedSeason([season(2), season(0, 'Specials'), season(1)], null, null)?.seasonNumber).toBe(
      1,
    )
  })

  it('falls back to specials when the series has no regular seasons', () => {
    expect(resolveSelectedSeason([season(0, 'Specials')], null, null)?.seasonNumber).toBe(0)
  })

  it('returns undefined when the series has no seasons', () => {
    expect(resolveSelectedSeason([], null, 1)).toBeUndefined()
  })
})
