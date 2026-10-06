import type { WatchedEpisodePair, WatchEventTvContext } from '@plotline/shared/log-watch'
import type { PayloadRequest, Where } from 'payload'

import { toWatchedEpisodeKey, toWatchedEpisodeKeyFromTvContext } from '@plotline/shared/log-watch'

const WATCHED_EPISODE_PAGE_SIZE = 500

export type LoadWatchedEpisodePairsOptions = {
  /** Watch event to leave out, e.g. the row a create hook is currently syncing. */
  excludeEventId?: number | string
}

/**
 * Pages watch events for a library item and returns unique season/episode pairs.
 *
 * Only rows with both `tvContext` coordinates are queried, and only `tvContext` is
 * selected, so series-level completed rows never leave the database. Callers must already
 * have authorized the library item: this query uses `overrideAccess` so it can run inside
 * the log-watch transaction and from the watched-episodes endpoint after the owner check.
 *
 * @param req - Payload request (uses the open transaction when present)
 * @param libraryItemId - Library item whose watch events to scan
 * @param options.excludeEventId - Event id to ignore
 * @returns Unique pairs sorted by season, then episode
 */
export async function loadWatchedEpisodePairs(
  req: PayloadRequest,
  libraryItemId: number,
  options?: LoadWatchedEpisodePairsOptions,
): Promise<WatchedEpisodePair[]> {
  const seen = new Set<string>()
  const pairs: WatchedEpisodePair[] = []
  const conditions: Where[] = [
    { libraryItem: { equals: libraryItemId } },
    { 'tvContext.season': { exists: true } },
    { 'tvContext.episode': { exists: true } },
  ]

  if (options?.excludeEventId != null) {
    conditions.push({ id: { not_equals: options.excludeEventId } })
  }

  let page = 1

  while (true) {
    const result = await req.payload.find({
      collection: 'watch-events',
      depth: 0,
      limit: WATCHED_EPISODE_PAGE_SIZE,
      overrideAccess: true,
      page,
      req,
      select: { tvContext: true },
      where: { and: conditions },
    })

    for (const event of result.docs) {
      const pair = toWatchedEpisodePair(event.tvContext)

      if (pair === null) {
        continue
      }

      const key = toWatchedEpisodeKey(pair.season, pair.episode)

      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      pairs.push(pair)
    }

    if (!result.hasNextPage || result.docs.length === 0) {
      break
    }

    page += 1
  }

  pairs.sort((left, right) => left.season - right.season || left.episode - right.episode)

  return pairs
}

// Drops non-integer coordinates; season 0 (specials) stays.
function toWatchedEpisodePair(
  tvContext: null | undefined | WatchEventTvContext,
): null | WatchedEpisodePair {
  if (tvContext == null || tvContext.season == null || tvContext.episode == null) {
    return null
  }

  if (toWatchedEpisodeKeyFromTvContext(tvContext) === null) {
    return null
  }

  return {
    episode: tvContext.episode,
    season: tvContext.season,
  }
}
