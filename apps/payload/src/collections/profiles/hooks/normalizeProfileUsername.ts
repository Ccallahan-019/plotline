import type { CollectionBeforeValidateHook } from 'payload'

import { normalizeUsername } from '../../../utilities/normalizeUsername'

export const normalizeProfileUsername: CollectionBeforeValidateHook = ({ data }) => {
  if (data?.username && typeof data.username === 'string') {
    data.username = normalizeUsername(data.username)
  }

  return data
}
