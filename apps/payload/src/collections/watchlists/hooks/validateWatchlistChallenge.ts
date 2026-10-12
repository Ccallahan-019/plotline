import { APIError, type CollectionBeforeValidateHook } from 'payload'

type ChallengeFields = {
  dueDate?: unknown
  enabled?: unknown
  goalCount?: unknown
  goalRuntimeMinutes?: unknown
  goalType?: unknown
}

/**
 * Requires a due date and a positive goal when challenge mode is on.
 *
 * A partial update is merged over the stored challenge so an admin edit that
 * only touches the name still validates the goal already saved. Count goals
 * must be a positive whole number of titles. Runtime goals must be a positive
 * whole number of minutes. Turning challenge mode off skips these checks.
 */
export const validateWatchlistChallenge: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  const challenge = readChallenge(data?.challenge, originalDoc?.challenge)

  if (challenge?.enabled !== true) {
    return data
  }

  if (!challenge.dueDate) {
    throw new APIError('Challenge dueDate is required when challenge mode is enabled', 400)
  }

  const goalType = challenge.goalType ?? 'count'

  if (goalType === 'count' && !isPositiveWholeNumber(challenge.goalCount)) {
    throw new APIError('Challenge goalCount must be greater than zero', 400)
  }

  if (goalType === 'runtime_minutes' && !isPositiveWholeNumber(challenge.goalRuntimeMinutes)) {
    throw new APIError('Challenge goalRuntimeMinutes must be greater than zero', 400)
  }

  if (goalType !== 'count' && goalType !== 'runtime_minutes') {
    throw new APIError('Challenge goalType must be count or runtime_minutes', 400)
  }

  return data
}

function isChallengeFields(value: unknown): value is ChallengeFields {
  return typeof value === 'object' && value !== null
}

// A positive integer. Missing, fractional, and non-positive goals fail.
function isPositiveWholeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
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
