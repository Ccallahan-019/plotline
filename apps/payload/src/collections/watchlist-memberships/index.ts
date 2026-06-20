import type { CollectionConfig } from 'payload'

import { LIST_STATUSES } from '@plotline/shared/constants/watchlist-challenge'

import { watchlistMembershipsAccess } from './access'
import { initializeMembershipChallengeFields } from './hooks/initializeMembershipChallengeFields'
import { recalculateStatsAfterMembershipChange } from './hooks/recalculateWatchlistStats'
import { validateWatchlistLibraryItemOwnership } from './hooks/validateWatchlistLibraryItemOwnership'

export const WatchlistMemberships: CollectionConfig = {
  access: watchlistMembershipsAccess,
  admin: {
    defaultColumns: ['watchlist', 'libraryItem', 'listStatus', 'addedAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      index: true,
      name: 'watchlist',
      relationTo: 'watchlists',
      required: true,
      type: 'relationship',
    },
    {
      index: true,
      name: 'libraryItem',
      relationTo: 'library-items',
      required: true,
      type: 'relationship',
    },
    {
      defaultValue: () => new Date().toISOString(),
      name: 'addedAt',
      required: true,
      type: 'date',
    },
    {
      name: 'sortOrder',
      type: 'number',
    },
    {
      name: 'note',
      type: 'text',
    },
    {
      name: 'listStatus',
      options: LIST_STATUSES.map((value) => ({ label: value, value })),
      type: 'select',
    },
    {
      name: 'completedForListAt',
      type: 'date',
    },
    {
      name: 'countsTowardGoal',
      type: 'checkbox',
    },
    {
      name: 'goalWeight',
      type: 'number',
    },
    {
      name: 'episodesCountedForList',
      type: 'number',
    },
    {
      admin: {
        description:
          'Episodes already watched on the library item when this membership was created; baseline for tv_by_episode counting.',
      },
      name: 'episodesAtJoin',
      type: 'number',
    },
  ],
  hooks: {
    afterChange: [recalculateStatsAfterMembershipChange],
    beforeValidate: [validateWatchlistLibraryItemOwnership, initializeMembershipChallengeFields],
  },
  indexes: [
    {
      fields: ['watchlist', 'libraryItem'],
      unique: true,
    },
  ],
  slug: 'watchlist-memberships',
}
