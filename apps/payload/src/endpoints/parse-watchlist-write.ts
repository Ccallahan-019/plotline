import {
  CHALLENGE_GOAL_TYPES,
  type ChallengeGoalType,
  isVisibility,
  PRIOR_COMPLETION_RULES,
  type PriorCompletionRule,
  TV_COUNT_RULES,
  type TvCountRule,
  type Visibility,
  WATCHLIST_DESCRIPTION_MAX_LENGTH,
  WATCHLIST_NAME_MAX_LENGTH,
} from '@plotline/shared/constants'

const WRITE_KEYS = ['challenge', 'coverMedia', 'description', 'name', 'visibility'] as const

const ENABLED_CHALLENGE_KEYS = [
  'dueDate',
  'enabled',
  'goalCount',
  'goalRuntimeMinutes',
  'goalType',
  'includeRewatches',
  'priorCompletionRule',
  'startDate',
  'tvCountRule',
] as const

export type WatchlistChallengeWrite =
  | {
      dueDate: string
      enabled: true
      goalCount: null | number
      goalRuntimeMinutes: null | number
      goalType: ChallengeGoalType
      includeRewatches: boolean
      priorCompletionRule: PriorCompletionRule
      startDate: null | string
      tvCountRule: TvCountRule
    }
  | {
      enabled: false
    }

export type WatchlistWrite = {
  challenge: WatchlistChallengeWrite
  coverMedia: null | number
  description: null | string
  name: string
  visibility: Visibility
}

/**
 * Accepts a watchlist create or update body.
 *
 * Requires `name`, `description`, `visibility`, `coverMedia`, and `challenge`.
 * Any other key is rejected so owner, slug, and system flags cannot be set here.
 * An enabled challenge needs a due date. Count goals need a positive number of
 * titles and runtime goals need a positive number of minutes. A list-size goal
 * leaves both numbers null; setting either one is rejected. The inactive goal
 * must be null. Dates are calendar days (`YYYY-MM-DD`) stored as UTC midnight.
 *
 * @param body - Parsed JSON body
 * @returns Fields to write, or a 400 response
 */
export function parseWatchlistWrite(body: unknown): Response | WatchlistWrite {
  if (!isRecord(body)) {
    return Response.json({ error: 'Request body must be an object' }, { status: 400 })
  }

  const keyError = exactKeysError(
    body,
    WRITE_KEYS,
    'Only name, description, visibility, coverMedia, and challenge can be saved',
    'name, description, visibility, coverMedia, and challenge are required',
  )

  if (keyError) {
    return keyError
  }

  const name = readName(body.name)

  if (name instanceof Response) {
    return name
  }

  const description = readDescription(body.description)

  if (description instanceof Response) {
    return description
  }

  if (!isVisibility(body.visibility)) {
    return Response.json(
      { error: 'visibility must be private, friends, public, or unlisted' },
      { status: 400 },
    )
  }

  const coverMedia = readCoverMedia(body.coverMedia)

  if (coverMedia instanceof Response) {
    return coverMedia
  }

  const challenge = readChallenge(body.challenge)

  if (challenge instanceof Response) {
    return challenge
  }

  return {
    challenge,
    coverMedia,
    description,
    name,
    visibility: body.visibility,
  }
}

// Unknown keys and missing keys get different messages so a renamed slug is not reported as a blank name.
function exactKeysError(
  record: Record<string, unknown>,
  keys: readonly string[],
  unknownKeyMessage: string,
  missingKeyMessage: string,
): null | Response {
  const actual = Object.keys(record)

  if (actual.some((key) => !keys.includes(key))) {
    return Response.json({ error: unknownKeyMessage }, { status: 400 })
  }

  if (keys.some((key) => !actual.includes(key))) {
    return Response.json({ error: missingKeyMessage }, { status: 400 })
  }

  return null
}

function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return values.some((item) => item === value)
}

function isPositiveWholeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readCalendarDate(value: unknown, label: string): Response | string {
  if (typeof value !== 'string' || !isRealCalendarDate(value)) {
    return Response.json({ error: `${label} must be a YYYY-MM-DD date` }, { status: 400 })
  }

  return `${value}T00:00:00.000Z`
}

function readChallenge(value: unknown): Response | WatchlistChallengeWrite {
  if (!isRecord(value) || typeof value.enabled !== 'boolean') {
    return Response.json({ error: 'challenge.enabled is required' }, { status: 400 })
  }

  if (!value.enabled) {
    const disabledKeys = exactKeysError(
      value,
      ['enabled'],
      'A disabled challenge only accepts enabled: false',
      'A disabled challenge only accepts enabled: false',
    )

    if (disabledKeys) {
      return disabledKeys
    }

    return { enabled: false }
  }

  const enabledKeys = exactKeysError(
    value,
    ENABLED_CHALLENGE_KEYS,
    'An enabled challenge requires its goal, dates, and counting rules',
    'An enabled challenge requires its goal, dates, and counting rules',
  )

  if (enabledKeys) {
    return enabledKeys
  }

  const dueDate = readRequiredCalendarDate(value.dueDate, 'dueDate')

  if (dueDate instanceof Response) {
    return dueDate
  }

  const startDate = readOptionalCalendarDate(value.startDate, 'startDate')

  if (startDate instanceof Response) {
    return startDate
  }

  // Both are `YYYY-MM-DDT00:00:00.000Z`, so string order is calendar order.
  if (startDate != null && startDate > dueDate) {
    return Response.json({ error: 'startDate must not be after dueDate' }, { status: 400 })
  }

  if (!isOneOf(CHALLENGE_GOAL_TYPES, value.goalType)) {
    return Response.json(
      { error: 'goalType must be count, list_size, or runtime_minutes' },
      { status: 400 },
    )
  }

  if (!isOneOf(TV_COUNT_RULES, value.tvCountRule)) {
    return Response.json({ error: 'tvCountRule is invalid' }, { status: 400 })
  }

  if (!isOneOf(PRIOR_COMPLETION_RULES, value.priorCompletionRule)) {
    return Response.json({ error: 'priorCompletionRule is invalid' }, { status: 400 })
  }

  if (typeof value.includeRewatches !== 'boolean') {
    return Response.json({ error: 'includeRewatches must be a boolean' }, { status: 400 })
  }

  const goals = readGoals(value.goalType, value.goalCount, value.goalRuntimeMinutes)

  if (goals instanceof Response) {
    return goals
  }

  return {
    dueDate,
    enabled: true,
    goalCount: goals.goalCount,
    goalRuntimeMinutes: goals.goalRuntimeMinutes,
    goalType: value.goalType,
    includeRewatches: value.includeRewatches,
    priorCompletionRule: value.priorCompletionRule,
    startDate,
    tvCountRule: value.tvCountRule,
  }
}

function readCoverMedia(value: unknown): null | number | Response {
  if (value === null) {
    return null
  }

  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value
  }

  return Response.json({ error: 'coverMedia must be a library title id or null' }, { status: 400 })
}

// Blank descriptions are stored as null. A non-string is rejected.
function readDescription(value: unknown): null | Response | string {
  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return Response.json({ error: 'description must be a string or null' }, { status: 400 })
  }

  const description = value.trim()

  if (description.length > WATCHLIST_DESCRIPTION_MAX_LENGTH) {
    return Response.json(
      {
        error: `Description must be ${WATCHLIST_DESCRIPTION_MAX_LENGTH} characters or fewer`,
      },
      { status: 400 },
    )
  }

  return description.length === 0 ? null : description
}

// Count and runtime keep one positive goal. List size keeps both numbers null.
function readGoals(
  goalType: ChallengeGoalType,
  goalCount: unknown,
  goalRuntimeMinutes: unknown,
): { goalCount: null | number; goalRuntimeMinutes: null | number } | Response {
  if (goalType === 'count') {
    if (goalRuntimeMinutes !== null) {
      return Response.json({ error: 'Only the active goal can be set' }, { status: 400 })
    }

    if (!isPositiveWholeNumber(goalCount)) {
      return Response.json(
        { error: 'Challenge goalCount must be greater than zero' },
        { status: 400 },
      )
    }

    return { goalCount, goalRuntimeMinutes: null }
  }

  if (goalType === 'list_size') {
    if (goalCount !== null || goalRuntimeMinutes !== null) {
      return Response.json({ error: 'Only the active goal can be set' }, { status: 400 })
    }

    return { goalCount: null, goalRuntimeMinutes: null }
  }

  if (goalCount !== null) {
    return Response.json({ error: 'Only the active goal can be set' }, { status: 400 })
  }

  if (!isPositiveWholeNumber(goalRuntimeMinutes)) {
    return Response.json(
      { error: 'Challenge goalRuntimeMinutes must be greater than zero' },
      { status: 400 },
    )
  }

  return { goalCount: null, goalRuntimeMinutes }
}

function readName(value: unknown): Response | string {
  if (typeof value !== 'string') {
    return Response.json({ error: 'name must be a string' }, { status: 400 })
  }

  const name = value.trim()

  if (name.length === 0) {
    return Response.json({ error: 'Enter a name' }, { status: 400 })
  }

  if (name.length > WATCHLIST_NAME_MAX_LENGTH) {
    return Response.json(
      { error: `Name must be ${WATCHLIST_NAME_MAX_LENGTH} characters or fewer` },
      { status: 400 },
    )
  }

  return name
}

function readOptionalCalendarDate(value: unknown, label: string): null | Response | string {
  if (value === null) {
    return null
  }

  return readCalendarDate(value, label)
}

function readRequiredCalendarDate(value: unknown, label: string): Response | string {
  if (value == null) {
    return Response.json(
      { error: `Challenge ${label} is required when challenge mode is enabled` },
      { status: 400 },
    )
  }

  return readCalendarDate(value, label)
}
