import type { CollectionConfig } from 'payload'

import { MEDIA_STATUSES, MEDIA_TYPES } from '@plotline/shared/constants/media'

import { libraryItemsAccess } from './access'
import { createCompletedWatchEvent } from './hooks/createCompletedWatchEvent'
import { stampStatusTransitionDates } from './hooks/stampStatusTransitionDates'
import { syncMembershipsFromLibraryItem } from './hooks/syncMembershipsFromLibraryItem'

export const LibraryItems: CollectionConfig = {
  access: libraryItemsAccess,
  admin: {
    defaultColumns: ['profile', 'media', 'status', 'lastWatchedAt'],
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
      index: true,
      name: 'status',
      options: MEDIA_STATUSES.map((value) => ({ label: value, value })),
      required: true,
      type: 'select',
    },
    {
      fields: [
        {
          name: 'type',
          options: MEDIA_TYPES.map((value) => ({ label: value, value })),
          required: true,
          type: 'select',
        },
        {
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'movie',
          },
          name: 'watched',
          type: 'checkbox',
        },
        {
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'tv',
          },
          name: 'lastSeason',
          type: 'number',
        },
        {
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'tv',
          },
          name: 'lastEpisode',
          type: 'number',
        },
        {
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'tv',
          },
          name: 'episodesWatched',
          type: 'number',
        },
        {
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'tv',
          },
          hasMany: true,
          name: 'seasonsCompleted',
          type: 'number',
        },
      ],
      name: 'progress',
      type: 'group',
    },
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      index: true,
      name: 'lastWatchedAt',
      type: 'date',
    },
    {
      defaultValue: 0,
      name: 'rewatchCount',
      type: 'number',
    },
    {
      name: 'personalNotes',
      type: 'textarea',
    },
    {
      name: 'source',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Import', value: 'import' },
        { label: 'Recommendation', value: 'recommendation' },
      ],
      type: 'select',
    },
  ],
  hooks: {
    afterChange: [createCompletedWatchEvent, syncMembershipsFromLibraryItem],
    beforeChange: [stampStatusTransitionDates],
  },
  indexes: [
    {
      fields: ['profile', 'media'],
      unique: true,
    },
  ],
  slug: 'library-items',
}
