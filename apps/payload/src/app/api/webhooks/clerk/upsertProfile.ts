import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { buildDisplayName, buildUsername } from './helpers'
import { ClerkUserPayload } from './types'
import { writeProfile } from './writeProfile'

export async function upsertProfile(user: ClerkUserPayload) {
  const payload = await getPayload({ config: configPromise })

  const existing = await payload.find({
    collection: 'profiles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      clerkUserId: {
        equals: user.id,
      },
    },
  })

  const profileData = {
    avatarUrl: user.image_url ?? undefined,
    clerkUserId: user.id,
    displayName: buildDisplayName(user),
    username: buildUsername(user),
  }

  if (existing.docs[0]) {
    return writeProfile(payload, {
      data: profileData,
      id: existing.docs[0].id,
      operation: 'update',
    })
  }

  return writeProfile(payload, {
    data: profileData,
    operation: 'create',
  })
}
