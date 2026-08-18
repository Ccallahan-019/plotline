import { toNonNegativeInteger } from '@plotline/shared/utils/toNonNegativeInteger'

import type { BatchLoggedEpisode } from '../../collections/watch-events/utils/buildBatchTvProgressUpdate'

export function parseLoggedEpisodes(episodes: unknown): BatchLoggedEpisode[] | Response {
  if (!Array.isArray(episodes) || episodes.length < 1) {
    return Response.json({ error: 'episodes must contain at least one entry' }, { status: 400 })
  }

  const parsedByKey = new Map<string, BatchLoggedEpisode>()

  for (const entry of episodes) {
    if (entry == null || typeof entry !== 'object') {
      return Response.json(
        { error: 'each episode must include valid season and episode numbers' },
        { status: 400 },
      )
    }

    const candidate = entry as { episode?: unknown; isRewatch?: unknown; season?: unknown }
    const season = toNonNegativeInteger(candidate.season)
    const episode = toNonNegativeInteger(candidate.episode)

    if (season === null || episode === null) {
      return Response.json(
        { error: 'each episode must include valid season and episode numbers' },
        { status: 400 },
      )
    }

    const key = `${season}:${episode}`
    const existing = parsedByKey.get(key)

    if (existing) {
      if (existing.isRewatch === true && candidate.isRewatch !== true) {
        parsedByKey.set(key, { episode, season })
      }

      continue
    }

    parsedByKey.set(key, {
      episode,
      season,
      ...(candidate.isRewatch === true ? { isRewatch: true } : {}),
    })
  }

  return [...parsedByKey.values()]
}
