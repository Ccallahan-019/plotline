import type { MediaType } from '@plotline/shared/constants'

import { STREAMING_PLATFORMS } from '@plotline/shared/constants'
import { z } from 'zod'

export const LOG_WATCH_WHEN_PRESETS = ['custom', 'today', 'yesterday'] as const

export type LogWatchWhenPreset = (typeof LOG_WATCH_WHEN_PRESETS)[number]

export const logWatchEpisodeInputSchema = z.object({
  episode: z.number().int().nonnegative(),
  isRewatch: z.boolean().optional(),
  season: z.number().int().nonnegative(),
})

export type LogWatchEpisodeInput = z.infer<typeof logWatchEpisodeInputSchema>

export const logWatchFormValuesSchema = z.object({
  episode: logWatchEpisodeInputSchema.optional(),
  episodes: z.array(logWatchEpisodeInputSchema),
  isRewatch: z.boolean(),
  platform: z.enum(STREAMING_PLATFORMS).optional(),
  platformOther: z.string(),
  watchedAt: z.date(),
  whenPreset: z.enum(LOG_WATCH_WHEN_PRESETS),
})

export type LogWatchFormValues = z.infer<typeof logWatchFormValuesSchema>

/**
 * Log-watch form schema with platform, date, and TV episode refinements.
 *
 * @param mediaType - TV requires at least one episode; movies skip that check
 * @returns A Zod schema for `LogWatchFormValues`
 */
export function createLogWatchFormSchema(mediaType: MediaType) {
  return logWatchFormValuesSchema.superRefine((values, ctx) => {
    if (values.platform === 'other' && values.platformOther.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a platform name',
        path: ['platformOther'],
      })
    }

    const startOfWatchedDay = startOfLocalDay(values.watchedAt)
    const startOfToday = startOfLocalDay(new Date())

    if (startOfWatchedDay > startOfToday) {
      ctx.addIssue({
        code: 'custom',
        message: 'Watch date cannot be in the future',
        path: ['watchedAt'],
      })
    }

    if (mediaType === 'tv' && values.episode == null && values.episodes.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select at least one episode',
        path: ['episodes'],
      })
    }
  })
}

// Local calendar-day timestamp used to reject future watch dates.
function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}
