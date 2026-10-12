import type { Watchlist } from '@plotline/payload-types'

import {
  CHALLENGE_GOAL_TYPES,
  PRIOR_COMPLETION_RULES,
  TV_COUNT_RULES,
  VISIBILITIES,
  WATCHLIST_DESCRIPTION_MAX_LENGTH,
  WATCHLIST_NAME_MAX_LENGTH,
} from '@plotline/shared/constants'
import { z } from 'zod'

import type { WatchlistWriteInput } from './watchlist-write'

export const watchlistFormSchema = z
  .object({
    challengeEnabled: z.boolean(),
    coverMediaId: z.number().int().positive().nullable(),
    description: z
      .string()
      .trim()
      .max(
        WATCHLIST_DESCRIPTION_MAX_LENGTH,
        `Description must be ${WATCHLIST_DESCRIPTION_MAX_LENGTH} characters or fewer`,
      ),
    dueDate: z.date().nullish(),
    goalCount: z.number().nullable(),
    goalHours: z.number().nullable(),
    goalType: z.enum(CHALLENGE_GOAL_TYPES),
    includeRewatches: z.boolean(),
    name: z
      .string()
      .trim()
      .min(1, 'Enter a name')
      .max(
        WATCHLIST_NAME_MAX_LENGTH,
        `Name must be ${WATCHLIST_NAME_MAX_LENGTH} characters or fewer`,
      ),
    priorCompletionRule: z.enum(PRIOR_COMPLETION_RULES),
    startDate: z.date().nullish(),
    tvCountRule: z.enum(TV_COUNT_RULES),
    visibility: z.enum(VISIBILITIES),
  })
  .superRefine((values, ctx) => {
    if (!values.challengeEnabled) {
      return
    }

    if (values.dueDate == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a due date',
        path: ['dueDate'],
      })
    }

    if (values.goalType === 'count') {
      addCountGoalIssue(values.goalCount, ctx)
      return
    }

    addRuntimeGoalIssue(values.goalHours, ctx)
  })

export type WatchlistFormValues = z.infer<typeof watchlistFormSchema>

type WatchlistFormSource = Partial<Pick<Watchlist, 'challenge' | 'coverMedia' | 'isSystem'>> &
  Pick<Watchlist, 'description' | 'name' | 'visibility'>

/**
 * Empty form for a new watchlist.
 *
 * `challengeEnabled` starts on when the page was opened from Challenges.
 *
 * @param challengeEnabled - Whether the challenge switch starts on
 * @returns Default field values
 */
export function createWatchlistFormValues(challengeEnabled: boolean): WatchlistFormValues {
  return {
    challengeEnabled,
    coverMediaId: null,
    description: '',
    dueDate: null,
    goalCount: null,
    goalHours: null,
    goalType: 'count',
    includeRewatches: false,
    name: '',
    priorCompletionRule: 'exclude_if_already_completed',
    startDate: null,
    tvCountRule: 'tv_as_series',
    visibility: 'private',
  }
}

/**
 * Form defaults for creating or editing a watchlist.
 *
 * A missing description becomes an empty string so the textarea stays controlled.
 * Stored minutes are shown as hours. System lists keep the challenge switch off.
 *
 * @param watchlist - Watchlist whose details fill the form
 * @returns Field values for the shared form
 */
export function toWatchlistFormValues(watchlist: WatchlistFormSource): WatchlistFormValues {
  const challenge = watchlist.challenge

  return {
    challengeEnabled: watchlist.isSystem === true ? false : challenge?.enabled === true,
    coverMediaId: readCoverMediaId(watchlist.coverMedia),
    description: watchlist.description?.trim() ?? '',
    dueDate: parseStoredCalendarDate(challenge?.dueDate),
    goalCount: challenge?.goalCount ?? null,
    goalHours: minutesToHours(challenge?.goalRuntimeMinutes),
    goalType: challenge?.goalType === 'runtime_minutes' ? 'runtime_minutes' : 'count',
    includeRewatches: challenge?.includeRewatches === true,
    name: watchlist.name,
    priorCompletionRule: challenge?.priorCompletionRule ?? 'exclude_if_already_completed',
    startDate: parseStoredCalendarDate(challenge?.startDate),
    tvCountRule: challenge?.tvCountRule ?? 'tv_as_series',
    visibility: watchlist.visibility,
  }
}

/**
 * Maps submitted form values to the watchlist write payload.
 *
 * Trims both text fields. A blank description is sent as `null`. Challenge mode
 * off sends only `enabled: false`. When it is on, hours become minutes and the
 * inactive goal is null. System lists always save with challenge mode off.
 *
 * @param values - Submitted form values
 * @param options.isSystem - When true, the challenge switch cannot turn the list into a challenge
 * @returns Name, visibility, cover, and challenge settings ready for the API
 */
export function toWatchlistWriteInput(
  values: WatchlistFormValues,
  options?: { isSystem?: boolean },
): WatchlistWriteInput {
  const description = values.description.trim()
  const details = {
    coverMedia: values.coverMediaId,
    description: description.length === 0 ? null : description,
    name: values.name.trim(),
    visibility: values.visibility,
  }

  if (!values.challengeEnabled || options?.isSystem === true) {
    return {
      ...details,
      challenge: { enabled: false },
    }
  }

  const dueDate = toCalendarDateString(values.dueDate)

  if (dueDate == null) {
    return {
      ...details,
      challenge: { enabled: false },
    }
  }

  return {
    ...details,
    challenge: {
      dueDate,
      enabled: true,
      goalCount: values.goalType === 'count' ? values.goalCount : null,
      goalRuntimeMinutes:
        values.goalType === 'runtime_minutes' ? hoursToMinutes(values.goalHours) : null,
      goalType: values.goalType,
      includeRewatches: values.includeRewatches,
      priorCompletionRule: values.priorCompletionRule,
      startDate: toCalendarDateString(values.startDate),
      tvCountRule: values.tvCountRule,
    },
  }
}

// Count goals are a positive whole number of titles. A blank field asks for a goal.
function addCountGoalIssue(goalCount: null | number, ctx: z.RefinementCtx) {
  if (goalCount == null) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a goal',
      path: ['goalCount'],
    })
    return
  }

  if (!Number.isInteger(goalCount) || goalCount <= 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a goal greater than zero',
      path: ['goalCount'],
    })
  }
}

// Runtime goals are hours. Anything that rounds to zero minutes is rejected.
function addRuntimeGoalIssue(goalHours: null | number, ctx: z.RefinementCtx) {
  if (goalHours == null) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a goal',
      path: ['goalHours'],
    })
    return
  }

  if (!(goalHours > 0) || hoursToMinutes(goalHours) == null) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a goal greater than zero',
      path: ['goalHours'],
    })
  }
}

// Hours on the form become stored minutes. A fraction that rounds to 0 is dropped.
function hoursToMinutes(hours: null | number | undefined): null | number {
  if (hours == null || !Number.isFinite(hours)) {
    return null
  }

  const minutes = Math.round(hours * 60)

  return minutes > 0 ? minutes : null
}

// Whole hours stay integers. A 90 minute goal is 1.5 hours.
function minutesToHours(minutes: null | number | undefined): null | number {
  if (minutes == null || !Number.isFinite(minutes)) {
    return null
  }

  return Math.round((minutes / 60) * 1000) / 1000
}

// Local calendar day from a stored `YYYY-MM-DD` or ISO timestamp.
function parseStoredCalendarDate(value: null | string | undefined): Date | null {
  if (!value) {
    return null
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

// Cover is stored as a media id. A populated media document contributes its id.
function readCoverMediaId(coverMedia: undefined | Watchlist['coverMedia']): null | number {
  if (coverMedia == null) {
    return null
  }

  return typeof coverMedia === 'number' ? coverMedia : coverMedia.id
}

// `YYYY-MM-DD` from the date picker, using the local calendar day.
function toCalendarDateString(date: Date | null | undefined): null | string {
  if (date == null || Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
