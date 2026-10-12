import {
  CHALLENGE_GOAL_TYPES,
  PRIOR_COMPLETION_RULES,
  TV_COUNT_RULES,
  VISIBILITIES,
  WATCHLIST_DESCRIPTION_MAX_LENGTH,
  WATCHLIST_NAME_MAX_LENGTH,
} from '@plotline/shared/constants'
import { z } from 'zod'

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
  .refine(isRealCalendarDate, 'Enter a valid date')

const disabledChallengeSchema = z
  .object({
    enabled: z.literal(false),
  })
  .strict()

const enabledChallengeSchema = z
  .object({
    dueDate: calendarDateSchema,
    enabled: z.literal(true),
    goalCount: z.number().int().positive().nullable(),
    goalRuntimeMinutes: z.number().int().positive().nullable(),
    goalType: z.enum(CHALLENGE_GOAL_TYPES),
    includeRewatches: z.boolean(),
    priorCompletionRule: z.enum(PRIOR_COMPLETION_RULES),
    startDate: calendarDateSchema.nullable(),
    tvCountRule: z.enum(TV_COUNT_RULES),
  })
  .strict()
  .superRefine((challenge, ctx) => {
    if (challenge.goalType === 'count') {
      if (challenge.goalRuntimeMinutes != null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Only the active goal can be set',
          path: ['goalRuntimeMinutes'],
        })
      }

      if (challenge.goalCount == null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a goal greater than zero',
          path: ['goalCount'],
        })
      }

      return
    }

    if (challenge.goalCount != null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Only the active goal can be set',
        path: ['goalCount'],
      })
    }

    if (challenge.goalRuntimeMinutes == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a goal greater than zero',
        path: ['goalRuntimeMinutes'],
      })
    }
  })

export const watchlistWriteSchema = z
  .object({
    challenge: z.discriminatedUnion('enabled', [
      disabledChallengeSchema,
      enabledChallengeSchema,
    ]),
    coverMedia: z.number().int().positive().nullable(),
    description: z.string().max(WATCHLIST_DESCRIPTION_MAX_LENGTH).nullable(),
    name: z
      .string()
      .trim()
      .min(1, 'Enter a name')
      .max(
        WATCHLIST_NAME_MAX_LENGTH,
        `Name must be ${WATCHLIST_NAME_MAX_LENGTH} characters or fewer`,
      ),
    visibility: z.enum(VISIBILITIES),
  })
  .strict()

export type WatchlistChallengeWriteInput = WatchlistWriteInput['challenge']

export type WatchlistWriteInput = z.infer<typeof watchlistWriteSchema>

/**
 * Parses a create or update body for the watchlist BFF.
 *
 * Trims the name. Challenge mode requires a due date and only the active goal.
 *
 * @param body - JSON body from the route
 * @returns The write payload, or the first validation message
 */
export function parseWatchlistWriteBody(
  body: unknown,
): { error: string; ok: false } | { ok: true; value: WatchlistWriteInput } {
  const result = watchlistWriteSchema.safeParse(body)

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid watchlist', ok: false }
  }

  return { ok: true, value: result.data }
}

// Rejects impossible days such as February 31. The month and day in the string must match UTC.
function isRealCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}
