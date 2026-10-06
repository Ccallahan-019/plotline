import type { WatchedEpisodePair, WatchEventTvContext } from '@plotline/shared/log-watch'
import type { PayloadRequest } from 'payload'

import { toWatchedEpisodeKey, toWatchedEpisodeKeyFromTvContext } from '@plotline/shared/log-watch'

const WATCHED_EPISODE_PAGE_SIZE = 100

/**
 * Pages watch events for a library item and returns unique season/episode pairs.
 *
 * Events without integer `tvContext` coordinates are ignored, including series-level
 * completed rows. Callers must already have authorized the library item: this query
 * uses `overrideAccess` so it can run inside the log-watch transaction and from the
 * watched-episodes endpoint after the owner check.
 *
 * @param req - Payload request (uses the open transaction when present)
 * @param libraryItemId - Library item whose watch events to scan
 * @returns Unique pairs sorted by season, then episode
 */
export async function loadWatchedEpisodePairs(
  req: PayloadRequest,
  libraryItemId: number,
): Promise<WatchedEpisodePair[]> {
  const seen = new Set<string>()
  const pairs: WatchedEpisodePair[] = []
  let page = 1

  while (true) {
    const result = await req.payload.find({
      collection: 'watch-events',
      depth: 0,
      limit: WATCHED_EPISODE_PAGE_SIZE,
      overrideAccess: true,
      page,
      req,
      where: {
        libraryItem: { equals: libraryItemId },
      },
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

// Drops series-level rows and non-integer coordinates; season 0 (specials) stays.
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
