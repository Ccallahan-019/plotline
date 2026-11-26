import { describe, expect, it } from 'vitest'

import type { MediaTitleSeason } from '../../types'

import {
  countSeasonEpisodesWatched,
  episodesInSeasonOrder,
  formatEpisodeCode,
  formatEpisodeDisplayName,
  formatEpisodeHeading,
  formatEpisodeMeta,
  formatEpisodeOverview,
  formatEpisodeRuntime,
  formatSeasonEpisodeCount,
  formatSeasonWatchedLabel,
  resolveSelectedEpisode,
  resolveSelectedSeason,
} from '../format-media-season'
import { formatReleaseDateLabel } from '../format-media-title'

const season = (seasonNumber: number, name = `Season ${seasonNumber}`): MediaTitleSeason => ({
  airDate: null,
  episodeCount: 9,
  name,
  overview: null,
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

describe('episodesInSeasonOrder', () => {
  it('sorts by episode number without mutating the input', () => {
    const episodes = [
      { air_date: null, episode_number: 2, name: 'Two', runtime: null },
      { air_date: null, episode_number: 1, name: 'One', runtime: null },
    ]

    expect(episodesInSeasonOrder(episodes).map((episode) => episode.episode_number)).toEqual([1, 2])
    expect(episodes.map((episode) => episode.episode_number)).toEqual([2, 1])
  })
})

describe('formatEpisodeCode', () => {
  it('formats the selected season and episode number', () => {
    expect(formatEpisodeCode(1, 1)).toBe('S1 · E1')
    expect(formatEpisodeCode(0, 12)).toBe('S0 · E12')
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

describe('formatEpisodeHeading', () => {
  it('writes the season and episode as a line', () => {
    expect(formatEpisodeHeading(1, 1)).toBe('Season 1 · Episode 1')
    expect(formatEpisodeHeading(0, 12)).toBe('Season 0 · Episode 12')
  })
})

describe('formatEpisodeOverview', () => {
  it('trims the synopsis and omits a blank overview', () => {
    expect(formatEpisodeOverview('  A start.  ')).toBe('A start.')
    expect(formatEpisodeOverview('   ')).toBeNull()
    expect(formatEpisodeOverview(null)).toBeNull()
    expect(formatEpisodeOverview(undefined)).toBeNull()
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

describe('resolveSelectedEpisode', () => {
  const episodes = [
    { air_date: null, episode_number: 3, name: 'Three', runtime: null },
    { air_date: null, episode_number: 1, name: 'One', runtime: null },
    { air_date: null, episode_number: 2, name: 'Two', runtime: null },
  ]

  it('keeps a number that is still in the list', () => {
    expect(resolveSelectedEpisode(episodes, 2)?.episode_number).toBe(2)
  })

  it('returns the first episode in season order otherwise', () => {
    expect(resolveSelectedEpisode(episodes, null)?.episode_number).toBe(1)
    expect(resolveSelectedEpisode(episodes, 9)?.episode_number).toBe(1)
  })

  it('returns nothing for an empty list', () => {
    expect(resolveSelectedEpisode([], 1)).toBeUndefined()
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
    expect(
      resolveSelectedSeason([season(2), season(0, 'Specials'), season(1)], null, null)
        ?.seasonNumber,
    ).toBe(1)
  })

  it('falls back to specials when the series has no regular seasons', () => {
    expect(resolveSelectedSeason([season(0, 'Specials')], null, null)?.seasonNumber).toBe(0)
  })

  it('returns undefined when the series has no seasons', () => {
    expect(resolveSelectedSeason([], null, 1)).toBeUndefined()
  })
})
