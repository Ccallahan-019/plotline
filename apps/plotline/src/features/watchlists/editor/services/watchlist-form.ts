import type { Watchlist } from '@plotline/payload-types'

import {
  CHALLENGE_GOAL_TYPES,
  type ChallengeGoalType,
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
    } else if (startsAfterDue(values.startDate, values.dueDate)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start date must not be after the due date',
        path: ['startDate'],
      })
    }

    if (values.goalType === 'count') {
      addCountGoalIssue(values.goalCount, ctx)
      return
    }

    // The goal is the qualifying titles on the list, so neither number is required.
    if (values.goalType === 'list_size') {
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
 * Stored minutes are shown as hours. A list-size goal stays list size so editing
 * it does not turn the challenge into a count goal. System lists keep the
 * challenge switch off.
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
    goalType: readFormGoalType(challenge?.goalType),
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
 * off sends only `enabled: false`. When it is on, a count goal sends titles, a
 * runtime goal sends minutes, and a list-size goal sends both numbers as null.
 * System lists always save with challenge mode off.
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

/**
 * Helper text under the editor heading.
 *
 * @param mode - `create` for a new list, `edit` for an existing one
 * @param challengeEnabled - Whether the challenge switch is on, which changes the wording
 * @returns One sentence describing what the form saves
 */
export function watchlistFormDescription(
  mode: 'create' | 'edit',
  challengeEnabled: boolean,
): string {
  return mode === 'create'
    ? challengeEnabled
      ? 'Name the challenge, decide who can see it, and choose the challenge settings.'
      : 'Name the watchlist, decide who can see it, and optionally turn it into a challenge.'
    : challengeEnabled
      ? "Change the challenge's name, visibility, goal, and due date."
      : "Change the watchlist's name, visibility, cover, and challenge settings."
}

/**
 * Label for the form's submit button.
 *
 * @param mode - `create` for a new list, `edit` for an existing one
 * @param challengeEnabled - Whether the challenge switch is on, which swaps "Watchlist" for "Challenge"
 * @returns The button text
 */
export function watchlistFormSubmitLabel(
  mode: 'create' | 'edit',
  challengeEnabled: boolean,
): string {
  return mode === 'create'
    ? challengeEnabled
      ? 'Create Challenge'
      : 'Create Watchlist'
    : challengeEnabled
      ? 'Save Challenge'
      : 'Save Watchlist'
}

/**
 * Heading for the editor page.
 *
 * @param mode - `create` for a new list, `edit` for an existing one
 * @param challengeEnabled - Whether the challenge switch is on, which swaps "Watchlist" for "Challenge"
 * @returns The page title
 */
export function watchlistFormTitle(mode: 'create' | 'edit', challengeEnabled: boolean): string {
  return mode === 'create'
    ? challengeEnabled
      ? 'New Challenge'
      : 'New Watchlist'
    : challengeEnabled
      ? 'Edit Challenge'
      : 'Edit Watchlist'
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

// Stored goal types pass through. A missing type stays on the count default.
function readFormGoalType(goalType: null | string | undefined): ChallengeGoalType {
  const match = CHALLENGE_GOAL_TYPES.find((type) => type === goalType)

  return match ?? 'count'
}

// True when both days are set and the start is a later calendar day than the due date.
function startsAfterDue(startDate: Date | null | undefined, dueDate: Date | null | undefined) {
  const start = toCalendarDateString(startDate)
  const due = toCalendarDateString(dueDate)

  return start != null && due != null && start > due
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
