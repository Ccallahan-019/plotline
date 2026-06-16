import type { CollectionAfterChangeHook } from 'payload'

import {
  computeEpisodesCountedForList,
  deriveMembershipChallengeFields,
  type WatchlistChallengeConfig,
} from '@plotline/shared/watchlist-stats'

import { getRelationId } from '../../../utilities/relations'
import {
  SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY,
  SKIP_WATCHLIST_STATS_RECALC,
} from '../../watchlists/context'
import { recalculateWatchlistsForLibraryItem } from '../utils/recalculateWatchlistsForLibraryItem'

export const syncMembershipsFromLibraryItem: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  req.context ??= {}

  if (
    context[SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY] ||
    req.context[SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY]
  ) {
    return doc
  }

  if (operation !== 'update') {
    return doc
  }

  const statusChanged = previousDoc?.status !== doc.status
  const progressChanged =
    JSON.stringify(previousDoc?.progress ?? null) !== JSON.stringify(doc.progress ?? null)

  if (!statusChanged && !progressChanged) {
    return doc
  }

  const memberships = await req.payload.find({
    collection: 'watchlist-memberships',
    depth: 1,
    limit: 1000,
    overrideAccess: true,
    req,
    where: {
      libraryItem: {
        equals: doc.id,
      },
    },
  })

  const mediaId = getRelationId(doc.media)
  const media =
    typeof doc.media === 'object' && doc.media != null
      ? doc.media
      : mediaId != null
        ? await req.payload.findByID({
            collection: 'media',
            depth: 0,
            id: mediaId,
            overrideAccess: true,
            req,
          })
        : null

  if (!media) {
    return doc
  }

  for (const membership of memberships.docs) {
    let watchlist =
      typeof membership.watchlist === 'object' && membership.watchlist != null
        ? membership.watchlist
        : null

    if (!watchlist) {
      const watchlistId = getRelationId(membership.watchlist)

      if (watchlistId == null) {
        continue
      }

      watchlist = await req.payload.findByID({
        collection: 'watchlists',
        depth: 0,
        id: watchlistId,
        overrideAccess: true,
        req,
      })
    }

    if (!watchlist) {
      continue
    }

    if (membership.listStatus === 'skipped') {
      continue
    }

    const addedAt = membership.addedAt
    const currentEpisodesWatched = doc.progress?.episodesWatched ?? 0
    const previousEpisodesWatched = previousDoc?.progress?.episodesWatched ?? currentEpisodesWatched
    const episodesAtJoin =
      membership.episodesAtJoin ??
      Math.max(0, previousEpisodesWatched - (membership.episodesCountedForList ?? 0))

    const derived = deriveMembershipChallengeFields({
      addedAt,
      challenge: watchlist.challenge as null | undefined | WatchlistChallengeConfig,
      episodesAtJoin,
      libraryItem: {
        completedAt: doc.completedAt,
        progress: doc.progress,
        status: doc.status,
      },
      media: {
        mediaType: media.mediaType,
        runtime: media.runtime,
        tvMeta: media.tvMeta,
      },
    })

    const episodesCountedForList = computeEpisodesCountedForList({
      addedAt,
      episodesAtJoin,
      libraryItem: {
        completedAt: doc.completedAt,
        progress: doc.progress,
        status: doc.status,
      },
    })

    const updateData: Record<string, unknown> = {
      countsTowardGoal: derived.countsTowardGoal,
      episodesAtJoin,
      episodesCountedForList,
      goalWeight: derived.goalWeight,
      listStatus: derived.listStatus,
    }

    if (derived.listStatus === 'completed' && membership.listStatus !== 'completed') {
      updateData.completedForListAt = doc.completedAt ?? new Date().toISOString()
    }

    await req.payload.update({
      collection: 'watchlist-memberships',
      context: {
        [SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY]: true,
        [SKIP_WATCHLIST_STATS_RECALC]: true,
      },
      data: updateData,
      id: membership.id,
      overrideAccess: true,
      req,
    })
  }

  await recalculateWatchlistsForLibraryItem(req.payload, doc.id, req)

  return doc
}
