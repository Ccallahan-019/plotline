import { toNonNegativeInteger } from '@plotline/shared/utils'

import type { BatchLoggedEpisode } from '../../collections/watch-events/utils/buildBatchTvProgressUpdate'

/** Upper bound on raw batch rows; every row is a create under the library-item row lock. */
export const MAX_LOGGED_EPISODES = 200

// Unique season/episode pairs in first-seen order. Rewatch is derived later, not from the body.
export function parseLoggedEpisodes(episodes: unknown): BatchLoggedEpisode[] | Response {
  if (!Array.isArray(episodes) || episodes.length < 1) {
    return Response.json({ error: 'episodes must contain at least one entry' }, { status: 400 })
  }

  if (episodes.length > MAX_LOGGED_EPISODES) {
    return Response.json(
      { error: `episodes must contain at most ${MAX_LOGGED_EPISODES} entries` },
      { status: 400 },
    )
  }

  const parsedByKey = new Map<string, BatchLoggedEpisode>()

  for (const entry of episodes) {
    const parsed = parseLoggedEpisode(entry)

    if (parsed === null) {
      return Response.json(
        { error: 'each episode must include valid season and episode numbers' },
        { status: 400 },
      )
    }

    const key = `${parsed.season}:${parsed.episode}`

    if (parsedByKey.has(key)) {
      continue
    }

    parsedByKey.set(key, parsed)
  }

  return [...parsedByKey.values()]
}

/**
 * Validates the single log-watch `tvContext` with the same rules as batch rows.
 *
 * A missing or empty context is a series-level log. Anything else must carry
 * non-negative integer season and episode numbers (numeric strings are coerced).
 *
 * @param tvContext - Raw `tvContext` from the request body
 * @returns The normalized pair, `undefined` for a series-level log, or a 400 response
 */
export function parseLogWatchTvContext(
  tvContext: unknown,
): BatchLoggedEpisode | Response | undefined {
  if (tvContext == null) {
    return undefined
  }

  if (typeof tvContext === 'object') {
    const candidate = tvContext as { episode?: unknown; season?: unknown }

    if (candidate.season == null && candidate.episode == null) {
      return undefined
    }
  }

  const parsed = parseLoggedEpisode(tvContext)

  if (parsed === null) {
    return Response.json(
      { error: 'tvContext must include valid season and episode numbers' },
      { status: 400 },
    )
  }

  return parsed
}

function parseLoggedEpisode(entry: unknown): BatchLoggedEpisode | null {
  if (entry == null || typeof entry !== 'object') {
    return null
  }

  const candidate = entry as { episode?: unknown; season?: unknown }
  const season = toNonNegativeInteger(candidate.season)
  const episode = toNonNegativeInteger(candidate.episode)

  if (season === null || episode === null) {
    return null
  }

  return { episode, season }
}
