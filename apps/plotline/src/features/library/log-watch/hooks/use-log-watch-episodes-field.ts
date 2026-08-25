'use client'

import { useState } from 'react'

import { getSeasonSelectOptions } from '../services/episode-field'
import { useTvSeasonEpisodes } from './use-tv-season-episodes'

type UseLogWatchEpisodesFieldOptions = {
  defaultSeason: number
  seasonCount?: null | number
  tmdbId?: null | number
}

/**
 * Viewing-season state and TMDB episode list for the full log-watch dialog picker.
 *
 * The query is disabled until `tmdbId` is a positive number. Season options always
 * include the season currently being viewed.
 *
 * @param options.defaultSeason - Season shown when the field mounts (from the current form selection)
 * @param options.seasonCount - Known series season count; falls back to the viewing season
 * @param options.tmdbId - TMDB series id; falsy values skip the fetch and use numeric add-episode UI
 * @returns Viewing season controls, season select options, TMDB query state, and whether to render the titled list
 */
export function useLogWatchEpisodesField({
  defaultSeason,
  seasonCount,
  tmdbId,
}: UseLogWatchEpisodesFieldOptions) {
  const [season, setSeason] = useState(defaultSeason)
  const hasTmdbId = tmdbId != null && tmdbId > 0
  const query = useTvSeasonEpisodes(tmdbId, season, {
    enabled: hasTmdbId,
  })
  const seasonOptions = getSeasonSelectOptions(seasonCount, season)
  const showTmdbEpisodeList = hasTmdbId && !query.isError

  return {
    ...query,
    hasTmdbId,
    season,
    seasonOptions,
    setSeason,
    showTmdbEpisodeList,
  }
}
