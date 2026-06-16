import type { CollectionConfig } from 'payload'

import { VISIBILITIES } from '@plotline/shared/constants/media'

import { profilesAccess } from './access'
import { normalizeProfileUsername } from './hooks/normalizeProfileUsername'
import { seedDefaultWatchlistsOnCreate } from './hooks/seedDefaultWatchlistsOnCreate'
import { PROFILE_STATS_CACHE_URI, profileStatsCacheSchema } from './stats-cache.schema'

export const Profiles: CollectionConfig = {
  access: profilesAccess,
  admin: {
    defaultColumns: ['displayName', 'username', 'clerkUserId', 'updatedAt'],
    useAsTitle: 'displayName',
  },
  fields: [
    {
      index: true,
      name: 'clerkUserId',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      index: true,
      name: 'username',
      required: true,
      type: 'text',
      unique: true,
    },
    {
      name: 'displayName',
      required: true,
      type: 'text',
    },
    {
      name: 'avatarUrl',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      fields: [
        {
          defaultValue: 'private',
          name: 'defaultListVisibility',
          options: VISIBILITIES.map((value) => ({ label: value, value })),
          type: 'select',
        },
        {
          defaultValue: true,
          name: 'spoilersHidden',
          type: 'checkbox',
        },
        {
          defaultValue: 'US',
          name: 'region',
          type: 'text',
        },
      ],
      name: 'preferences',
      type: 'group',
    },
    {
      fields: [
        {
          defaultValue: true,
          name: 'showActivity',
          type: 'checkbox',
        },
        {
          defaultValue: true,
          name: 'showRatings',
          type: 'checkbox',
        },
      ],
      name: 'privacySettings',
      type: 'group',
    },
    {
      admin: {
        readOnly: true,
      },
      jsonSchema: {
        fileMatch: [PROFILE_STATS_CACHE_URI],
        schema: profileStatsCacheSchema,
        uri: PROFILE_STATS_CACHE_URI,
      },
      name: 'statsCache',
      type: 'json',
    },
  ],
  hooks: {
    afterChange: [seedDefaultWatchlistsOnCreate],
    beforeValidate: [normalizeProfileUsername],
  },
  slug: 'profiles',
}
