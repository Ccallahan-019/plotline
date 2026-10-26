import type { ChallengeGoalType } from '@plotline/shared/constants'

import { CHALLENGE_GOAL_TYPES } from '@plotline/shared/constants'
import { APIError, type CollectionBeforeValidateHook } from 'payload'

type ChallengeFields = {
  dueDate?: unknown
  enabled?: unknown
  goalCount?: unknown
  goalRuntimeMinutes?: unknown
  goalType?: unknown
}

type ChallengeWrite = {
  challenge: ChallengeFields
}

/**
 * Requires a due date and the active goal when challenge mode is on.
 *
 * A partial update is merged over the stored challenge so an admin edit that
 * only touches the name still validates the goal already saved. Count goals
 * must be a positive whole number of titles. Runtime goals must be a positive
 * whole number of minutes. A list-size goal requires the due date only.
 * When the write includes the challenge group, goal numbers for the other
 * types are set to null so a goal-type change cannot keep the previous count
 * or runtime. A write that omits the challenge group leaves stored goals
 * untouched. Turning challenge mode off skips these checks.
 */
export const validateWatchlistChallenge: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  const challenge = readChallenge(data?.challenge, originalDoc?.challenge)

  if (challenge?.enabled !== true) {
    return data
  }

  if (!challenge.dueDate) {
    throw new APIError('Challenge dueDate is required when challenge mode is enabled', 400)
  }

  const goalType = readGoalType(challenge.goalType)

  if (goalType == null) {
    throw new APIError('Challenge goalType must be count, list_size, or runtime_minutes', 400)
  }

  assertActiveGoal(challenge, goalType)

  return withInactiveGoalsCleared(data, challenge, goalType)
}

// Count and runtime require their own positive number. List size has no stored goal.
function assertActiveGoal(challenge: ChallengeFields, goalType: ChallengeGoalType): void {
  switch (goalType) {
    case 'count':
      if (!isPositiveWholeNumber(challenge.goalCount)) {
        throw new APIError('Challenge goalCount must be greater than zero', 400)
      }

      return
    case 'list_size':
      return
    case 'runtime_minutes':
      if (!isPositiveWholeNumber(challenge.goalRuntimeMinutes)) {
        throw new APIError('Challenge goalRuntimeMinutes must be greater than zero', 400)
      }

      return
    default: {
      const _exhaustive: never = goalType

      return _exhaustive
    }
  }
}

// True when the merged number is present and this write does not already send null.
function goalNumberWouldSurvive(incoming: unknown, merged: unknown): boolean {
  return incoming !== null && merged != null
}

// Goal fields that must not remain set for this type.
function inactiveGoalFields(
  goalType: ChallengeGoalType,
): ReadonlyArray<'goalCount' | 'goalRuntimeMinutes'> {
  switch (goalType) {
    case 'count':
      return ['goalRuntimeMinutes']
    case 'list_size':
      return ['goalCount', 'goalRuntimeMinutes']
    case 'runtime_minutes':
      return ['goalCount']
    default: {
      const _exhaustive: never = goalType

      return _exhaustive
    }
  }
}

// Null inactive goals that would otherwise survive this write. No patch when they are already empty.
function inactiveGoalPatch(
  incoming: ChallengeFields,
  merged: ChallengeFields,
  goalType: ChallengeGoalType,
): null | Partial<Record<'goalCount' | 'goalRuntimeMinutes', null>> {
  const patch: Partial<Record<'goalCount' | 'goalRuntimeMinutes', null>> = {}

  for (const field of inactiveGoalFields(goalType)) {
    if (goalNumberWouldSurvive(incoming[field], merged[field])) {
      patch[field] = null
    }
  }

  return Object.keys(patch).length === 0 ? null : patch
}

// Any plain object can carry challenge fields. Missing keys stay undefined.
function isChallengeFields(value: unknown): value is ChallengeFields {
  return isRecord(value)
}

// A document write that includes the challenge group.
function isChallengeWrite(value: unknown): value is ChallengeWrite {
  return isRecord(value) && isChallengeFields(value.challenge)
}

// A positive integer. Missing, fractional, and non-positive goals fail.
function isPositiveWholeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

// A non-null object, so callers can read its fields.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Incoming challenge fields win, so an explicit null goal is not filled from the stored row.
function readChallenge(incoming: unknown, previous: unknown): ChallengeFields | null {
  if (incoming == null) {
    return isChallengeFields(previous) ? previous : null
  }

  if (!isChallengeFields(incoming)) {
    return isChallengeFields(previous) ? previous : null
  }

  return {
    ...(isChallengeFields(previous) ? previous : {}),
    ...incoming,
  }
}

// Missing goal type stays count, matching the collection default. Unknown values fail closed.
function readGoalType(value: unknown): ChallengeGoalType | null {
  if (value == null) {
    return 'count'
  }

  return CHALLENGE_GOAL_TYPES.find((goalType) => goalType === value) ?? null
}

// Writes nulls onto the incoming challenge group. A name-only write has no group and is unchanged.
function withInactiveGoalsCleared<T>(
  data: T,
  merged: ChallengeFields,
  goalType: ChallengeGoalType,
): T {
  if (!isChallengeWrite(data)) {
    return data
  }

  const patch = inactiveGoalPatch(data.challenge, merged, goalType)

  if (patch == null) {
    return data
  }

  return {
    ...data,
    challenge: {
      ...data.challenge,
      ...patch,
    },
  }
}
