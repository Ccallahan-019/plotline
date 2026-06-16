import type { CollectionConfig } from 'payload'

import {
  STREAMING_PLATFORMS,
  VISIBILITIES,
  WATCH_EVENT_TYPES,
} from '@plotline/shared/constants/media'

import { watchEventsAccess } from './access'
import { syncLibraryItemFromWatchEvent } from './hooks/syncLibraryItemFromWatchEvent'

export const WatchEvents: CollectionConfig = {
  access: watchEventsAccess,
  admin: {
    defaultColumns: ['profile', 'media', 'eventType', 'watchedAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      index: true,
      name: 'profile',
      relationTo: 'profiles',
      required: true,
      type: 'relationship',
    },
    {
      index: true,
      name: 'media',
      relationTo: 'media',
      required: true,
      type: 'relationship',
    },
    {
      name: 'libraryItem',
      relationTo: 'library-items',
      type: 'relationship',
    },
    {
      index: true,
      name: 'eventType',
      options: WATCH_EVENT_TYPES.map((value) => ({ label: value, value })),
      required: true,
      type: 'select',
    },
    {
      index: true,
      name: 'watchedAt',
      required: true,
      type: 'date',
    },
    {
      index: true,
      name: 'platform',
      options: STREAMING_PLATFORMS.map((value) => ({ label: value, value })),
      type: 'select',
    },
    {
      admin: {
        condition: (data) => data?.platform === 'other',
      },
      name: 'platformOther',
      type: 'text',
    },
    {
      name: 'runtimeMinutes',
      type: 'number',
    },
    {
      fields: [
        {
          name: 'season',
          type: 'number',
        },
        {
          name: 'episode',
          type: 'number',
        },
      ],
      name: 'tvContext',
      type: 'group',
    },
    {
      defaultValue: false,
      name: 'isRewatch',
      type: 'checkbox',
    },
    {
      defaultValue: 'private',
      name: 'visibility',
      options: VISIBILITIES.filter((value) => value !== 'unlisted').map((value) => ({
        label: value,
        value,
      })),
      required: true,
      type: 'select',
    },
  ],
  hooks: {
    afterChange: [syncLibraryItemFromWatchEvent],
  },
  slug: 'watch-events',
}
