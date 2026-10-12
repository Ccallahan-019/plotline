import type { LibraryItem, Media, Watchlist, WatchlistMembership } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

import { deriveMembershipChallengeFields } from '@plotline/shared/watchlist-stats'

import {
  clearWatchlistSyncSkipFlags,
  SKIP_MEMBERSHIP_SYNC_FROM_LIBRARY,
  SKIP_WATCHLIST_STATS_RECALC,
} from '../context'

/**
 * Rewrites list-scoped challenge fields after watchlist challenge settings change.
 *
 * Stats recalc reads stored `countsTowardGoal`, `listStatus`, and `goalWeight`, so a
 * change such as `includeRewatches` has to land on memberships first. `excludeFromGoal`
 * stays as stored and is folded into `countsTowardGoal`. Skipped memberships stay as
 * the member left them. Skip flags cover these writes only and are cleared before
 * return so the caller can recalculate stats on the same request.
 *
 * @param req - Payload request whose transaction the membership writes join
 * @param watchlist - Watchlist whose challenge config just changed
 */
export async function syncMembershipsForChallengeChange(
  req: PayloadRequest,
  watchlist: Pick<Watchlist, 'challenge' | 'id'>,
): Promise<void> {
  const memberships = await req.payload.find({
    collection: 'watchlist-memberships',
    depth: 2,
    limit: 1000,
    overrideAccess: true,
    req,
    where: {
      watchlist: {
        equals: watchlist.id,
      },
    },
  })

  for (const membership of memberships.docs) {
    if (membership.listStatus === 'skipped') {
      continue
    }

    const libraryItem = await resolveLibraryItem(req, membership.libraryItem)

    if (!libraryItem) {
      continue
    }

    const media = await resolveMedia(req, libraryItem.media)

    if (!media) {
      continue
    }

    const episodesWatched = libraryItem.progress?.episodesWatched ?? 0
    const episodesAtJoin =
      membership.episodesAtJoin ??
      Math.max(0, episodesWatched - (membership.episodesCountedForList ?? 0))

    const derived = deriveMembershipChallengeFields({
      addedAt: membership.addedAt,
      challenge: watchlist.challenge,
      episodesAtJoin,
      // Not written below, so a manual opt-out survives the rule change.
      excludeFromGoal: membership.excludeFromGoal,
      libraryItem: {
        completedAt: libraryItem.completedAt,
        progress: libraryItem.progress,
        rewatchCount: libraryItem.rewatchCount,
        status: libraryItem.status,
      },
      media: {
        mediaType: media.mediaType,
        runtime: media.runtime,
        tvMeta: media.tvMeta,
      },
    })

    const updateData: Record<string, unknown> = {
      countsTowardGoal: derived.countsTowardGoal,
      episodesAtJoin,
      episodesCountedForList: derived.episodesCountedForList,
      goalWeight: derived.goalWeight,
      listStatus: derived.listStatus,
    }

    if (derived.listStatus === 'completed' && membership.listStatus !== 'completed') {
      updateData.completedForListAt = libraryItem.completedAt ?? new Date().toISOString()
    }

    if (membershipChallengeFieldsMatch(membership, updateData)) {
      continue
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

  clearWatchlistSyncSkipFlags(req.context)
}

// True when the derived challenge fields are already stored, including a new completion time.
function membershipChallengeFieldsMatch(
  membership: WatchlistMembership,
  updateData: Record<string, unknown>,
): boolean {
  if (membership.countsTowardGoal !== updateData.countsTowardGoal) {
    return false
  }

  if (membership.episodesAtJoin !== updateData.episodesAtJoin) {
    return false
  }

  if (membership.episodesCountedForList !== updateData.episodesCountedForList) {
    return false
  }

  if (membership.goalWeight !== updateData.goalWeight) {
    return false
  }

  if (membership.listStatus !== updateData.listStatus) {
    return false
  }

  if (
    'completedForListAt' in updateData &&
    membership.completedForListAt !== updateData.completedForListAt
  ) {
    return false
  }

  return true
}

// Uses the populated library item, or loads it when the membership find did not.
async function resolveLibraryItem(
  req: PayloadRequest,
  libraryItem: WatchlistMembership['libraryItem'],
): Promise<LibraryItem | null> {
  if (typeof libraryItem === 'object') {
    return libraryItem
  }

  return req.payload.findByID({
    collection: 'library-items',
    depth: 1,
    id: libraryItem,
    overrideAccess: true,
    req,
  })
}

// Uses populated media, or loads it when the library item only has an id.
async function resolveMedia(
  req: PayloadRequest,
  media: LibraryItem['media'],
): Promise<Media | null> {
  if (typeof media === 'object') {
    return media
  }

  return req.payload.findByID({
    collection: 'media',
    depth: 0,
    id: media,
    overrideAccess: true,
    req,
  })
}
