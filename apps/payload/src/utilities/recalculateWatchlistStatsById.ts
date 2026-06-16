import { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'
import {
  computeWatchlistStats,
  StatsMembershipInput,
  WatchlistChallengeConfig,
} from '@plotline/shared/watchlist-stats'
import { Payload, PayloadRequest } from 'payload'

import { SKIP_WATCHLIST_STATS_RECALC } from '@/collections/watchlists/context'

export async function recalculateWatchlistStatsById(
  payload: Payload,
  watchlistId: number | string,
  req?: PayloadRequest,
): Promise<void> {
  if (req?.context?.[SKIP_WATCHLIST_STATS_RECALC]) {
    return
  }

  const watchlist = await payload.findByID({
    collection: 'watchlists',
    depth: 0,
    id: watchlistId,
    overrideAccess: true,
    req,
  })

  if (!watchlist) {
    return
  }

  const memberships = await payload.find({
    collection: 'watchlist-memberships',
    depth: 2,
    limit: 1000,
    overrideAccess: true,
    req,
    where: {
      watchlist: {
        equals: watchlistId,
      },
    },
  })

  const statsMemberships = memberships.docs.flatMap((membership) => {
    const libraryItem =
      typeof membership.libraryItem === 'object' && membership.libraryItem != null
        ? membership.libraryItem
        : null
    const media =
      libraryItem && typeof libraryItem.media === 'object' && libraryItem.media != null
        ? libraryItem.media
        : null

    if (!libraryItem || !media) {
      return []
    }

    return [toStatsMembership(membership, libraryItem, media)]
  })

  const statsCache = computeWatchlistStats({
    challenge: watchlist.challenge as null | undefined | WatchlistChallengeConfig,
    memberships: statsMemberships,
    watchlistCreatedAt: watchlist.createdAt,
  })

  await payload.update({
    collection: 'watchlists',
    context: {
      [SKIP_WATCHLIST_STATS_RECALC]: true,
    },
    data: {
      statsCache,
    },
    id: watchlistId,
    overrideAccess: true,
    req,
  })
}

function toStatsMembership(
  membership: WatchlistMembership,
  libraryItem: LibraryItem,
  media: Media,
): StatsMembershipInput {
  return {
    addedAt: membership.addedAt,
    completedForListAt: membership.completedForListAt ?? null,
    countsTowardGoal: membership.countsTowardGoal ?? true,
    episodesCountedForList: membership.episodesCountedForList ?? 0,
    goalWeight: membership.goalWeight ?? 1,
    libraryItem: {
      completedAt: libraryItem.completedAt ?? null,
      progress: libraryItem.progress,
      status: libraryItem.status,
    },
    listStatus: membership.listStatus ?? 'planned',
    media: {
      mediaType: media.mediaType,
      runtime: media.runtime ?? null,
      tvMeta: media.tvMeta,
    },
  }
}
