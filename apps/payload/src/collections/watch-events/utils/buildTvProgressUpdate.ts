export function buildTvProgressUpdate(tvContext: {
  episode?: null | number
  season?: null | number
}): {
  episodesWatched?: number
  lastEpisode?: number
  lastSeason?: number
  type: 'tv'
} {
  const episode = toProgressNumber(tvContext.episode)
  const season = toProgressNumber(tvContext.season)

  return {
    type: 'tv',
    ...(episode !== undefined ? { episodesWatched: episode, lastEpisode: episode } : {}),
    ...(season !== undefined ? { lastSeason: season } : {}),
  }
}

function toProgressNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}
