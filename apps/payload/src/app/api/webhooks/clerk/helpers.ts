import { ValidationError } from 'payload'

import { normalizeUsername } from '@/utilities/normalizeUsername'

import { ClerkUserPayload } from './types'

export function buildDisplayName(user: ClerkUserPayload): string {
  const parts = [user.first_name, user.last_name].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  )

  if (parts.length > 0) {
    return parts.join(' ')
  }

  return user.username ?? user.id
}

export function buildUsername(user: ClerkUserPayload): string {
  if (user.username) {
    return normalizeUsername(user.username)
  }

  return normalizeUsername(user.id.replace(/^user_/, ''))
}

export function isUsernameUniqueConflict(error: unknown): boolean {
  if (!(error instanceof ValidationError) || error.data.collection !== 'profiles') {
    return false
  }

  return error.data.errors.some(
    (fieldError) =>
      fieldError.path === 'username' &&
      /value must be unique|already exists|already in use/i.test(fieldError.message),
  )
}
