import type { CollectionConfig } from 'payload'

import { VISIBILITIES } from '@plotline/shared/constants/media'
import {
  CHALLENGE_GOAL_TYPES,
  PRIOR_COMPLETION_RULES,
  TV_COUNT_RULES,
} from '@plotline/shared/constants/watchlist-challenge'

import { watchlistsAccess } from './access'
import { preventSystemWatchlistDelete } from './hooks/preventSystemWatchlistDelete'
import { recalculateStatsAfterWatchlistChange } from './hooks/recalculateStatsOnChange'
import { validateWatchlistChallenge } from './hooks/validateWatchlistChallenge'
import { WATCHLIST_STATS_CACHE_URI, watchlistStatsCacheSchema } from './stats-cache.schema'

export const Watchlists: CollectionConfig = {
  access: watchlistsAccess,
  admin: {
    defaultColumns: ['name', 'owner', 'visibility', 'isSystem'],
    useAsTitle: 'name',
  },
  fields: [
    {
      index: true,
      name: 'owner',
      relationTo: 'profiles',
      required: true,
      type: 'relationship',
    },
    {
      name: 'name',
      required: true,
      type: 'text',
    },
    {
      index: true,
      name: 'slug',
      required: true,
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      defaultValue: 'private',
      name: 'visibility',
      options: VISIBILITIES.map((value) => ({ label: value, value })),
      required: true,
      type: 'select',
    },
    {
      defaultValue: false,
      name: 'isDefault',
      type: 'checkbox',
    },
    {
      defaultValue: false,
      name: 'isSystem',
      type: 'checkbox',
    },
    {
      name: 'sortOrder',
      type: 'number',
    },
    {
      name: 'coverMedia',
      relationTo: 'media',
      type: 'relationship',
    },
    {
      fields: [
        {
          defaultValue: false,
          name: 'enabled',
          type: 'checkbox',
        },
        {
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          name: 'startDate',
          type: 'date',
        },
        {
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          name: 'dueDate',
          type: 'date',
        },
        {
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          defaultValue: 'count',
          name: 'goalType',
          options: CHALLENGE_GOAL_TYPES.map((value) => ({ label: value, value })),
          type: 'select',
        },
        {
          admin: {
            condition: (_, siblingData) =>
              siblingData?.enabled === true && siblingData?.goalType === 'count',
          },
          name: 'goalCount',
          type: 'number',
        },
        {
          admin: {
            condition: (_, siblingData) =>
              siblingData?.enabled === true && siblingData?.goalType === 'runtime_minutes',
          },
          name: 'goalRuntimeMinutes',
          type: 'number',
        },
        {
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          defaultValue: 'tv_as_series',
          name: 'tvCountRule',
          options: TV_COUNT_RULES.map((value) => ({ label: value, value })),
          type: 'select',
        },
        {
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          defaultValue: 'exclude_if_already_completed',
          name: 'priorCompletionRule',
          options: PRIOR_COMPLETION_RULES.map((value) => ({ label: value, value })),
          type: 'select',
        },
        {
          admin: {
            condition: (_, siblingData) => siblingData?.enabled === true,
          },
          defaultValue: false,
          name: 'includeRewatches',
          type: 'checkbox',
        },
      ],
      name: 'challenge',
      type: 'group',
    },
    {
      admin: {
        readOnly: true,
      },
      jsonSchema: {
        fileMatch: [WATCHLIST_STATS_CACHE_URI],
        schema: watchlistStatsCacheSchema,
        uri: WATCHLIST_STATS_CACHE_URI,
      },
      name: 'statsCache',
      type: 'json',
    },
  ],
  hooks: {
    afterChange: [recalculateStatsAfterWatchlistChange],
    beforeDelete: [preventSystemWatchlistDelete],
    beforeValidate: [validateWatchlistChallenge],
  },
  indexes: [
    {
      fields: ['owner', 'slug'],
      unique: true,
    },
  ],
  slug: 'watchlists',
}
