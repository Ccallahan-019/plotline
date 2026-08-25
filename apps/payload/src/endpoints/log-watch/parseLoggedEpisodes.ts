import { toNonNegativeInteger } from '@plotline/shared/utils'

import type { BatchLoggedEpisode } from '../../collections/watch-events/utils/buildBatchTvProgressUpdate'

// Unique season/episode pairs in first-seen order. Rewatch is derived later, not from the body.
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

    const candidate = entry as { episode?: unknown; season?: unknown }
    const season = toNonNegativeInteger(candidate.season)
    const episode = toNonNegativeInteger(candidate.episode)

    if (season === null || episode === null) {
      return Response.json(
        { error: 'each episode must include valid season and episode numbers' },
        { status: 400 },
      )
    }

    const key = `${season}:${episode}`

    if (parsedByKey.has(key)) {
      continue
    }

    parsedByKey.set(key, { episode, season })
  }

  return [...parsedByKey.values()]
}
