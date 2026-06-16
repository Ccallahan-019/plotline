import { getPayload } from 'payload'

import { isUsernameUniqueConflict } from './helpers'
import { ProfileWriteInput } from './types'

export async function writeProfile(
  payload: Awaited<ReturnType<typeof getPayload>>,
  input: ProfileWriteInput,
) {
  try {
    if (input.operation === 'update') {
      return await payload.update({
        collection: 'profiles',
        data: input.data,
        id: input.id,
        overrideAccess: true,
      })
    }

    return await payload.create({
      collection: 'profiles',
      data: input.data,
      overrideAccess: true,
    })
  } catch (error) {
    if (!isUsernameUniqueConflict(error)) {
      throw error
    }

    const data = {
      ...input.data,
      username: `${input.data.username}-${Date.now().toString(36)}`,
    }

    if (input.operation === 'update') {
      return await payload.update({
        collection: 'profiles',
        data,
        id: input.id,
        overrideAccess: true,
      })
    }

    return await payload.create({
      collection: 'profiles',
      data,
      overrideAccess: true,
    })
  }
}
