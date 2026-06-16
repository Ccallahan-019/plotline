import type { JSONSchema4 } from 'json-schema'

export const WATCHLIST_STATS_CACHE_URI = 'plotline://schemas/watchlist-stats-cache.json'

export const watchlistStatsCacheSchema: JSONSchema4 = {
  additionalProperties: false,
  properties: {
    actualPerDay: { type: 'number' },
    completed: { type: 'number' },
    completedRuntimeMinutes: { type: 'number' },
    daysElapsed: { type: 'number' },
    daysRemaining: { type: 'number' },
    daysTotal: { type: 'number' },
    goalCount: { type: 'number' },
    goalRuntimeMinutes: { type: 'number' },
    inProgress: { type: 'number' },
    lastCalculatedAt: { format: 'date-time', type: 'string' },
    onTrack: { type: 'boolean' },
    percentComplete: { type: 'number' },
    projectedFinishDate: { format: 'date', type: 'string' },
    remaining: { type: 'number' },
    remainingRuntimeMinutes: { type: 'number' },
    requiredPerDay: { type: 'number' },
    status: {
      enum: ['not_started', 'active', 'completed', 'overdue'],
      type: 'string',
    },
    totalEligible: { type: 'number' },
  },
  required: [
    'totalEligible',
    'completed',
    'inProgress',
    'remaining',
    'percentComplete',
    'lastCalculatedAt',
  ],
  type: 'object',
}
