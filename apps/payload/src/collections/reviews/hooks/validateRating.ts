import { APIError, type CollectionBeforeValidateHook } from 'payload'

function isValidRating(value: number): boolean {
  if (value < 0.5 || value > 10) {
    return false
  }

  return Number.isInteger(value * 2)
}

export const validateRating: CollectionBeforeValidateHook = ({ data }) => {
  if (typeof data?.rating === 'number' && !isValidRating(data.rating)) {
    throw new APIError('Rating must be between 0.5 and 10 in 0.5 increments', 400)
  }

  return data
}
