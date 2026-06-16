import { APIError, type CollectionBeforeValidateHook } from 'payload'

export const validateWatchlistChallenge: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  const challenge = data?.challenge ?? originalDoc?.challenge
  const enabled = challenge?.enabled === true

  if (!enabled) {
    return data
  }

  if (!challenge?.dueDate) {
    throw new APIError('Challenge dueDate is required when challenge mode is enabled', 400)
  }

  const goalType = challenge.goalType ?? 'count'

  if (goalType === 'count' && challenge.goalCount != null && challenge.goalCount <= 0) {
    throw new APIError('Challenge goalCount must be greater than zero', 400)
  }

  if (
    goalType === 'runtime_minutes' &&
    challenge.goalRuntimeMinutes != null &&
    challenge.goalRuntimeMinutes <= 0
  ) {
    throw new APIError('Challenge goalRuntimeMinutes must be greater than zero', 400)
  }

  return data
}
