import type { WatchlistChallengeConfig } from '@plotline/shared/watchlist-stats'
import type { CollectionBeforeValidateHook } from 'payload'

import { deriveMembershipChallengeFields } from '@plotline/shared/watchlist-stats'

import { getRelationId } from '../../../utilities/relations'

export const initializeMembershipChallengeFields: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !data?.watchlist || !data.libraryItem) {
    return data
  }

  const watchlistId = getRelationId(data.watchlist)
  const libraryItemId = getRelationId(data.libraryItem)

  if (watchlistId == null || libraryItemId == null) {
    return data
  }

  const [watchlist, libraryItem] = await Promise.all([
    req.payload.findByID({
      collection: 'watchlists',
      depth: 0,
      id: watchlistId,
      overrideAccess: true,
    }),
    req.payload.findByID({
      collection: 'library-items',
      depth: 1,
      id: libraryItemId,
      overrideAccess: true,
    }),
  ])

  if (!watchlist || !libraryItem) {
    return data
  }

  const media =
    typeof libraryItem.media === 'object' && libraryItem.media != null ? libraryItem.media : null

  if (!media) {
    return data
  }

  const addedAt = data.addedAt ?? new Date().toISOString()
  const episodesAtJoin = libraryItem.progress?.episodesWatched ?? 0
  const derived = deriveMembershipChallengeFields({
    addedAt,
    challenge: watchlist.challenge as null | undefined | WatchlistChallengeConfig,
    episodesAtJoin,
    libraryItem: {
      completedAt: libraryItem.completedAt,
      progress: libraryItem.progress,
      status: libraryItem.status,
    },
    media: {
      mediaType: media.mediaType,
      runtime: media.runtime,
      tvMeta: media.tvMeta,
    },
  })

  return {
    ...data,
    addedAt,
    countsTowardGoal: derived.countsTowardGoal,
    episodesAtJoin,
    episodesCountedForList: derived.episodesCountedForList,
    goalWeight: derived.goalWeight,
    listStatus: derived.listStatus,
    ...(derived.listStatus === 'completed'
      ? { completedForListAt: libraryItem.completedAt ?? addedAt }
      : {}),
  }
}
