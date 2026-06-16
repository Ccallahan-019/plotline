import type { CollectionConfig } from 'payload'

import { MEDIA_RELEASE_STATUSES, MEDIA_TYPES } from '@plotline/shared/constants/media'

import { mediaAccess } from './access'
import { deriveDecadeAndSearchKeywords } from './hooks/deriveDecadeAndSearchKeywords'
import { enforceUniqueTmdbMedia } from './hooks/enforceUniqueTmdbMedia'

export const Media: CollectionConfig = {
  access: mediaAccess,
  admin: {
    defaultColumns: ['title', 'mediaType', 'tmdbId', 'releaseDate', 'metadataSyncedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      index: true,
      name: 'tmdbId',
      required: true,
      type: 'number',
    },
    {
      index: true,
      name: 'mediaType',
      options: MEDIA_TYPES.map((value) => ({ label: value, value })),
      required: true,
      type: 'select',
    },
    {
      name: 'title',
      required: true,
      type: 'text',
    },
    {
      name: 'originalTitle',
      type: 'text',
    },
    {
      name: 'overview',
      type: 'textarea',
    },
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'posterPath',
      type: 'text',
    },
    {
      name: 'backdropPath',
      type: 'text',
    },
    {
      index: true,
      name: 'releaseDate',
      type: 'date',
    },
    {
      index: true,
      name: 'decade',
      type: 'number',
    },
    {
      name: 'status',
      options: MEDIA_RELEASE_STATUSES.map((value) => ({ label: value, value })),
      type: 'select',
    },
    {
      name: 'runtime',
      type: 'number',
    },
    {
      fields: [
        {
          name: 'id',
          required: true,
          type: 'number',
        },
        {
          name: 'name',
          required: true,
          type: 'text',
        },
      ],
      name: 'genres',
      type: 'array',
    },
    {
      name: 'popularity',
      type: 'number',
    },
    {
      name: 'voteAverage',
      type: 'number',
    },
    {
      admin: {
        condition: (data) => data?.mediaType === 'tv',
      },
      fields: [
        {
          name: 'seasonCount',
          type: 'number',
        },
        {
          name: 'episodeCount',
          type: 'number',
        },
        {
          name: 'inProduction',
          type: 'checkbox',
        },
        {
          index: true,
          name: 'nextEpisodeDate',
          type: 'date',
        },
        {
          name: 'nextEpisodeSeason',
          type: 'number',
        },
        {
          name: 'nextEpisodeNumber',
          type: 'number',
        },
      ],
      name: 'tvMeta',
      type: 'group',
    },
    {
      fields: [
        {
          name: 'imdbId',
          type: 'text',
        },
        {
          name: 'tvdbId',
          type: 'number',
        },
      ],
      name: 'externalIds',
      type: 'group',
    },
    {
      name: 'metadataSyncedAt',
      type: 'date',
    },
    {
      index: true,
      name: 'searchKeywords',
      type: 'text',
    },
  ],
  hooks: {
    beforeChange: [deriveDecadeAndSearchKeywords],
    beforeValidate: [enforceUniqueTmdbMedia],
  },
  indexes: [
    {
      fields: ['tmdbId', 'mediaType'],
      unique: true,
    },
  ],
  slug: 'media',
}
