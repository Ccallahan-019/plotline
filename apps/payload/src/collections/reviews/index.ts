import type { CollectionConfig } from 'payload'

import { VISIBILITIES } from '@plotline/shared/constants/media'

import { reviewsAccess } from './access'
import { validateRating } from './hooks/validateRating'

export const Reviews: CollectionConfig = {
  access: reviewsAccess,
  admin: {
    defaultColumns: ['profile', 'media', 'rating', 'updatedAt'],
    useAsTitle: 'title',
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
      name: 'rating',
      required: true,
      type: 'number',
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      defaultValue: false,
      name: 'containsSpoilers',
      type: 'checkbox',
    },
    {
      name: 'watchedAt',
      type: 'date',
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
    beforeValidate: [validateRating],
  },
  indexes: [
    {
      fields: ['profile', 'media'],
      unique: true,
    },
  ],
  slug: 'reviews',
}
