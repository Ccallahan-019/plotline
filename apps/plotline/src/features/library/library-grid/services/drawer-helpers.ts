import { formatNumber as formatNumberShared } from '@plotline/shared/utils/formatNumber'

export function formatBoolean(value: boolean | null): null | string {
  if (value === null) {
    return null
  }

  return value ? 'Yes' : 'No'
}

export function formatEpisodeProgressLabel(
  episodesWatched: null | number,
  episodeCount: null | number,
): string {
  const watched = episodesWatched != null ? String(episodesWatched) : '—'

  return `${watched} / ${episodeCount ?? '—'}`
}

export function formatNumber(value: null | number): null | string {
  if (value === null) {
    return null
  }

  return formatNumberShared(value)
}

export function formatSeasonsCompleted(seasons: null | number[]): null | string {
  if (!seasons || seasons.length === 0) {
    return null
  }

  return seasons.join(', ')
}

export function getEpisodeProgressValue(
  episodesWatched: null | number,
  episodeCount: null | number,
): null | number {
  if (episodesWatched == null || episodeCount == null || episodeCount <= 0) {
    return null
  }

  return Math.min(100, Math.round((episodesWatched / episodeCount) * 100))
}
