import type { JSONSchema4 } from 'json-schema'

export const PROFILE_STATS_CACHE_URI = 'plotline://schemas/profile-stats-cache.json'

const profileStatsCacheObjectSchema: JSONSchema4 = {
  additionalProperties: false,
  properties: {
    hoursWatched: { type: 'number' },
    lastCalculatedAt: { format: 'date-time', type: 'string' },
    totalCompleted: { type: 'number' },
    totalPlanned: { type: 'number' },
    totalWatching: { type: 'number' },
  },
  required: ['lastCalculatedAt'],
  type: 'object',
}

/** Allows null so cache invalidation updates can explicitly clear the field. */
export const profileStatsCacheSchema: JSONSchema4 = {
  oneOf: [{ type: 'null' }, profileStatsCacheObjectSchema],
}
